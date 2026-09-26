<?php

namespace App\Http\Controllers;

use App\Domains\Pembayaran\Services\MidtransService;
use App\Domains\Pengiriman\Services\BiteshipService;
use App\Mail\KonfirmasiPesananMail;
use App\Models\ItemPesanan;
use App\Models\PenggunaLoyalitas;
use App\Models\Pesanan;
use App\Models\PesananPembayaran;
use App\Models\PesananPengiriman;
use App\Models\ProdukVarian;
use App\Models\VoucherTerpakai;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class MidtransWebhookController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService,
        protected BiteshipService $biteshipService
    ) {}

    /**
     * Endpoint HTTP POST Webhook Notification dari Midtrans Sandbox/Production.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info("Midtrans Webhook Received: ", $payload);

        $orderId = $payload['order_id'] ?? '';
        $statusCode = (string)($payload['status_code'] ?? '');
        $grossAmount = (string)($payload['gross_amount'] ?? '');
        $signatureKey = $payload['signature_key'] ?? '';
        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus = $payload['fraud_status'] ?? 'accept';

        if (empty($orderId) || empty($signatureKey)) {
            return response()->json(['sukses' => false, 'pesan' => 'Payload tidak lengkap'], 400);
        }

        // 1. Verifikasi Signature SHA-512
        if (!$this->midtransService->verifikasiSignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            Log::warning("Midtrans Webhook Invalid Signature for Order: {$orderId}");
            return response()->json(['sukses' => false, 'pesan' => 'Signature Key tidak valid'], 403);
        }

        // Midtrans mengirim order_id dengan replace '/' menjadi '-'
        // Kita ubah kembali ke format asli jika perlu, atau cari berdasarkan nomor_pesanan
        $nomorPesananAsli = str_replace('-', '/', $orderId);
        $pesanan = Pesanan::where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $orderId)
            ->first();

        if (!$pesanan) {
            Log::info("Midtrans Webhook Order Not Found (Test Notification or Non-Existent): {$orderId}");
            return response()->json(['sukses' => true, 'pesan' => 'Pesanan tidak ditemukan, notifikasi diterima.'], 200);
        }

        // 2. Cek Idempotensi (Jika sudah lunas/akan_dikirim/dikirim, lewati)
        if (in_array($pesanan->status, ['akan_dikirim', 'dikirim', 'selesai'])) {
            Log::info("Midtrans Webhook Idempotent Skip for Order: {$pesanan->nomor_pesanan}");
            return response()->json(['sukses' => true, 'pesan' => 'Pesanan sudah diproses sebelumnya']);
        }

        DB::beginTransaction();
        try {
            $pembayaran = PesananPembayaran::where('pesanan_id', $pesanan->id)->first();
            $pengiriman = PesananPengiriman::where('pesanan_id', $pesanan->id)->first();

            if (in_array($transactionStatus, ['settlement', 'capture']) && $fraudStatus === 'accept') {
                // STATUS SETTLEMENT / SUKSES BAYAR
                $pesanan->status = 'akan_dikirim';
                $pesanan->save();

                if ($pembayaran) {
                    $pembayaran->midtrans_status = $transactionStatus;
                    $pembayaran->waktu_bayar = now();
                    $pembayaran->payment_payload = $payload;
                    $pembayaran->save();
                }

                // UNIFIED LOGISTICS PIPELINE: Otomatis Alokasi Order Pengiriman ke Biteship API
                if ($pengiriman) {
                    $alamat = null;
                    if ($pesanan->pengguna_id) {
                        $alamat = DB::table('alamat_pengguna')
                            ->where('pengguna_id', $pesanan->pengguna_id)
                            ->orderByDesc('adalah_utama')
                            ->first();
                    }

                    // Ambil detail item dengan bobot gram aktual dari relasi produk
                    $items = ItemPesanan::where('pesanan_id', $pesanan->id)->with('produk')->get()->map(function ($item) {
                        $beratGram = (int)($item->produk->berat_gram ?? 250);
                        return [
                            'name' => $item->nama_produk,
                            'value' => (int)$item->harga,
                            'quantity' => $item->jumlah,
                            'weight' => $beratGram > 0 ? $beratGram : 250,
                        ];
                    })->toArray();

                    $dataBiteship = [
                        'area_id' => $alamat->area_id ?? 'IDNP11KOT789311',
                        'nama_penerima' => $alamat->nama_penerima ?? ($pesanan->pengguna->name ?? 'Pelanggan CRSL Official'),
                        'telepon' => $alamat->telepon ?? '081234567890',
                        'alamat_lengkap' => $alamat->alamat_lengkap ?? 'Condongcatur, Sleman, D.I. Yogyakarta',
                        'kode_pos' => $alamat->kode_pos ?? '55281',
                        'kurir' => strtolower($pengiriman->kurir ?? 'jne'),
                        'layanan' => strtolower($pengiriman->layanan ?? 'reg'),
                        'items' => $items,
                        'is_dropship' => (bool)$pesanan->is_dropship,
                        'dropship_pengirim' => $pesanan->dropship_pengirim,
                        'dropship_telepon' => $pesanan->dropship_telepon,
                    ];

                    $resBiteship = $this->biteshipService->buatOrderPengiriman($dataBiteship);
                    $pengiriman->biteship_order_id = $resBiteship['biteship_order_id'] ?? null;
                    $pengiriman->nomor_resi = !empty($resBiteship['waybill_id']) 
                        ? $resBiteship['waybill_id'] 
                        : (strtoupper($pengiriman->kurir ?? 'JNE') . '-' . date('Ymd') . '-' . strtoupper(Str::random(6)));
                    $pengiriman->tracking_status = $resBiteship['status'] ?? 'allocated';
                    $pengiriman->json_payload = $resBiteship;
                    $pengiriman->save();

                    Log::info("Biteship Order Allocated: Resi {$pengiriman->nomor_resi} for Order {$pesanan->nomor_pesanan}");
                }

                // UPDATE POIN LOYALITAS PELANGGAN
                if ($pesanan->pengguna_id && $pesanan->poin_didapat > 0) {
                    $loyalitas = PenggunaLoyalitas::firstOrCreate(
                        ['pengguna_id' => $pesanan->pengguna_id],
                        ['poin' => 0, 'total_belanja' => 0]
                    );
                    $loyalitas->poin += $pesanan->poin_didapat;
                    $loyalitas->total_belanja += $pesanan->total;
                    $loyalitas->save();

                    \Illuminate\Support\Facades\Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                    \Illuminate\Support\Facades\Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                }

                // EMAIL NOTIFIKASI PEMBAYARAN BERHASIL
                if ($pesanan->pengguna && $pesanan->pengguna->email) {
                    try {
                        Mail::to($pesanan->pengguna->email)->send(new KonfirmasiPesananMail($pesanan));
                    } catch (\Throwable $e) {
                        Log::error("Failed to send order confirmation email: " . $e->getMessage());
                    }
                }

                Log::info("Pesanan Lunas & Express Shipping Allocated: {$pesanan->nomor_pesanan}");

            } elseif ($transactionStatus === 'pending') {
                if ($pembayaran) {
                    $pembayaran->midtrans_status = 'pending';
                    if (!empty($payload['va_numbers'][0]['va_number'])) {
                        $pembayaran->nomor_va = $payload['va_numbers'][0]['va_number'];
                    } elseif (!empty($payload['permata_va_number'])) {
                        $pembayaran->nomor_va = $payload['permata_va_number'];
                    }
                    if (!empty($payload['qr_string'])) {
                        $pembayaran->qr_string = $payload['qr_string'];
                    }
                    $pembayaran->payment_payload = $payload;
                    $pembayaran->save();
                }
                Log::info("Pesanan Status Pending & VA/QR Synced: {$pesanan->nomor_pesanan}");

            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
                // STATUS DIBATALKAN / EXPIRED
                $pesanan->status = 'dibatalkan';
                $pesanan->save();

                if ($pembayaran) {
                    $pembayaran->midtrans_status = $transactionStatus;
                    $pembayaran->payment_payload = $payload;
                    $pembayaran->save();
                }

                // SKENARIO ROLLBACK: Kembalikan Stok Varian Produk
                $items = ItemPesanan::where('pesanan_id', $pesanan->id)->get();
                foreach ($items as $item) {
                    if ($item->produk_varian_id) {
                        ProdukVarian::where('id', $item->produk_varian_id)
                            ->increment('stok', $item->jumlah);
                    }
                }

                // SKENARIO ROLLBACK: Kembalikan Saldo Poin Loyalitas
                if ($pesanan->pengguna_id && $pesanan->poin_digunakan > 0) {
                    $loyalitas = PenggunaLoyalitas::firstOrCreate(
                        ['pengguna_id' => $pesanan->pengguna_id],
                        ['poin' => 0, 'total_belanja' => 0]
                    );
                    $loyalitas->increment('poin', $pesanan->poin_digunakan);
                    \Illuminate\Support\Facades\Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                    \Illuminate\Support\Facades\Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                }

                // SKENARIO ROLLBACK: Kembalikan Kuota Voucher
                if ($pesanan->kode_voucher) {
                    \App\Models\Voucher::where('kode', $pesanan->kode_voucher)->increment('kuota', 1);
                    VoucherTerpakai::where('pesanan_id', $pesanan->id)->delete();
                }

                Log::info("Pesanan Dibatalkan & Stok/Loyalitas/Voucher Rollback: {$pesanan->nomor_pesanan}");
            }

            DB::commit();
            return response()->json(['sukses' => true, 'pesan' => 'Webhook Midtrans berhasil diproses']);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Midtrans Webhook Exception: " . $e->getMessage());
            return response()->json(['sukses' => false, 'pesan' => 'Terjadi kesalahan sistem'], 500);
        }
    }
}
