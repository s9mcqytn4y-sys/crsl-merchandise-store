<?php

namespace App\Http\Controllers;

use App\Domains\Payment\Services\MidtransService;
use App\Domains\Shipping\Services\BiteshipService;
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
            Log::error("Midtrans Webhook Order Not Found: {$orderId}");
            return response()->json(['sukses' => false, 'pesan' => 'Pesanan tidak ditemukan'], 404);
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
                    $alamat = DB::table('alamat_pengguna')->where('pengguna_id', $pesanan->pengguna_id)->first();
                    $items = ItemPesanan::where('pesanan_id', $pesanan->id)->get()->map(function ($item) {
                        return [
                            'name' => $item->nama_produk,
                            'value' => (int)$item->harga,
                            'quantity' => $item->jumlah,
                            'weight' => 250,
                        ];
                    })->toArray();

                    $dataBiteship = [
                        'area_id' => $alamat->area_id ?? 'IDNP11KOT789311',
                        'nama_penerima' => $alamat->nama_penerima ?? 'Pelanggan CRSL',
                        'telepon' => $alamat->telepon ?? '081234567890',
                        'alamat_lengkap' => $alamat->alamat_lengkap ?? 'Alamat Pelanggan',
                        'kode_pos' => $alamat->kode_pos ?? '55281',
                        'kurir' => $pengiriman->kurir ?? 'jne',
                        'layanan' => $pengiriman->layanan ?? 'reg',
                        'items' => $items,
                        'is_dropship' => (bool)$pesanan->is_dropship,
                        'dropship_pengirim' => $pesanan->dropship_pengirim,
                        'dropship_telepon' => $pesanan->dropship_telepon,
                    ];

                    $resBiteship = $this->biteshipService->buatOrderPengiriman($dataBiteship);
                    $pengiriman->biteship_order_id = $resBiteship['biteship_order_id'] ?? null;
                    $pengiriman->nomor_resi = $resBiteship['waybill_id'] ?? ('RESI-' . strtoupper(Str::random(8)));
                    $pengiriman->tracking_status = $resBiteship['status'] ?? 'allocated';
                    $pengiriman->json_payload = $resBiteship;
                    $pengiriman->save();
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
                }

                Log::info("Pesanan Lunas & Express Shipping Allocated: {$pesanan->nomor_pesanan}");

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

                Log::info("Pesanan Dibatalkan & Stok Rollback: {$pesanan->nomor_pesanan}");
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
