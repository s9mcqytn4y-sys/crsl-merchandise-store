<?php

namespace App\Http\Controllers;

use App\Domains\Pembayaran\Services\MidtransService;
use App\Domains\Pengiriman\Jobs\AlokasiPengirimanBiteshipJob;
use App\Mail\KonfirmasiPesananMail;
use App\Models\ItemPesanan;
use App\Models\PenggunaLoyalitas;
use App\Models\Pesanan;
use App\Models\PesananPembayaran;
use App\Models\PesananPengiriman;
use App\Models\ProdukVarian;
use App\Models\Voucher;
use App\Models\VoucherTerpakai;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MidtransWebhookController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService
    ) {}

    /**
     * Endpoint HTTP POST Webhook Notification dari Midtrans Sandbox/Production.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info("Midtrans Webhook Received", ['order_id' => $payload['order_id'] ?? null]);

        $orderId = (string)($payload['order_id'] ?? '');
        $statusCode = (string)($payload['status_code'] ?? '');
        $grossAmount = (string)($payload['gross_amount'] ?? '');
        $signatureKey = (string)($payload['signature_key'] ?? '');
        $transactionStatus = (string)($payload['transaction_status'] ?? '');
        $fraudStatus = (string)($payload['fraud_status'] ?? 'accept');

        if (empty($orderId) || empty($signatureKey)) {
            return response()->json(['sukses' => false, 'pesan' => 'Payload tidak lengkap'], 400);
        }

        // 1. Verifikasi Signature SHA-512
        if (!$this->midtransService->verifikasiSignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            Log::warning("Midtrans Webhook Invalid Signature: {$orderId}");
            return response()->json(['sukses' => false, 'pesan' => 'Signature Key tidak valid'], 403);
        }

        $nomorPesananAsli = str_replace('-', '/', $orderId);

        // 2. Transaksi Database dengan Row Locking
        $needsDispatchShipping = false;
        $orderToDispatch = null;

        try {
            DB::beginTransaction();

            /** @var Pesanan|null $pesanan */
            $pesanan = Pesanan::with(['pengguna', 'pengiriman'])
                ->where('nomor_pesanan', $nomorPesananAsli)
                ->orWhere('nomor_pesanan', $orderId)
                ->lockForUpdate()
                ->first();

            if (!$pesanan) {
                DB::rollBack();
                Log::info("Midtrans Webhook Order Not Found: {$orderId}");
                return response()->json(['sukses' => true, 'pesan' => 'Pesanan tidak ditemukan'], 200);
            }

            // Validasi Kesesuaian Nominal (Anti-Tampering)
            if ((int)round($pesanan->total) !== (int)round((float)$grossAmount)) {
                DB::rollBack();
                Log::error("Midtrans Webhook Amount Mismatch for {$orderId}: DB={$pesanan->total}, Webhook={$grossAmount}");
                return response()->json(['sukses' => false, 'pesan' => 'Nominal tagihan tidak sesuai'], 422);
            }

            // Cek Idempotensi
            if (in_array($pesanan->status, ['akan_dikirim', 'dikirim', 'selesai', 'dibatalkan'])) {
                DB::rollBack();
                return response()->json(['sukses' => true, 'pesan' => 'Pesanan sudah diproses sebelumnya']);
            }

            $pembayaran = PesananPembayaran::where('pesanan_id', $pesanan->id)->first();

            // A. STATUS SUKSES (Settlement / Capture)
            if (in_array($transactionStatus, ['settlement', 'capture']) && $fraudStatus === 'accept') {
                $pesanan->status = 'akan_dikirim';
                $pesanan->save();

                if ($pembayaran) {
                    $pembayaran->midtrans_status = $transactionStatus;
                    $pembayaran->waktu_bayar = now();
                    $pembayaran->payment_payload = $payload;
                    $pembayaran->save();
                }

                // Tambah Poin Loyalitas Pelanggan
                if ($pesanan->pengguna_id && $pesanan->poin_didapat > 0) {
                    $loyalitas = PenggunaLoyalitas::firstOrCreate(
                        ['pengguna_id' => $pesanan->pengguna_id],
                        ['poin' => 0, 'total_belanja' => 0]
                    );
                    $loyalitas->poin += $pesanan->poin_didapat;
                    $loyalitas->total_belanja += $pesanan->total;
                    $loyalitas->save();

                    Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                    Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                }

                $needsDispatchShipping = true;
                $orderToDispatch = $pesanan;

            // B. STATUS PENDING
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

            // C. STATUS BATAL / EXPIRED
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
                $pesanan->status = 'dibatalkan';
                $pesanan->save();

                if ($pembayaran) {
                    $pembayaran->midtrans_status = $transactionStatus;
                    $pembayaran->payment_payload = $payload;
                    $pembayaran->save();
                }

                // Rollback Stok Varian
                $items = ItemPesanan::where('pesanan_id', $pesanan->id)->get();
                foreach ($items as $item) {
                    if ($item->produk_varian_id) {
                        ProdukVarian::where('id', $item->produk_varian_id)->increment('stok', $item->jumlah);
                    }
                }

                // Rollback Poin Loyalitas
                if ($pesanan->pengguna_id && $pesanan->poin_digunakan > 0) {
                    $loyalitas = PenggunaLoyalitas::firstOrCreate(
                        ['pengguna_id' => $pesanan->pengguna_id],
                        ['poin' => 0, 'total_belanja' => 0]
                    );
                    $loyalitas->increment('poin', $pesanan->poin_digunakan);
                    Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                    Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                }

                // Rollback Kuota Voucher
                if ($pesanan->kode_voucher) {
                    Voucher::where('kode', $pesanan->kode_voucher)->increment('kuota', 1);
                    VoucherTerpakai::where('pesanan_id', $pesanan->id)->delete();
                }
            }

            DB::commit();

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Midtrans Webhook DB Exception: " . $e->getMessage());
            return response()->json(['sukses' => false, 'pesan' => 'Terjadi kesalahan sistem'], 500);
        }

        // 3. Dispatch Asynchronous Queue Job (Biteship & Email) di Luar DB Transaction
        if ($needsDispatchShipping && $orderToDispatch) {
            $this->dispatchPengirimanDanNotifikasi($orderToDispatch);
        }

        return response()->json(['sukses' => true, 'pesan' => 'Webhook berhasil diproses']);
    }

    /**
     * Mengantrekan pembuatan order Biteship dan email konfirmasi ke Background Worker.
     */
    protected function dispatchPengirimanDanNotifikasi(Pesanan $pesanan): void
    {
        $savedAddress = is_array($pesanan->pengiriman?->json_payload) ? $pesanan->pengiriman->json_payload : [];
        $targetEmail = $pesanan->pengguna?->email ?? ($savedAddress['email'] ?? null);

        if ($targetEmail) {
            // Pola Chained Queue: Biteship dieksekusi dulu -> Setelah waybill_id terbit, kirim Email beresinya
            Bus::chain([
                new AlokasiPengirimanBiteshipJob($pesanan->id),
                function () use ($pesanan, $targetEmail) {
                    $pesananSegar = Pesanan::with(['pengiriman', 'itemPesanan.produk'])->find($pesanan->id);
                    if ($pesananSegar) {
                        Mail::to($targetEmail)->send(new KonfirmasiPesananMail($pesananSegar));
                    }
                },
            ])->dispatch();
        } else {
            // Jika tidak ada email tujuan, cukup alokasikan kurir
            AlokasiPengirimanBiteshipJob::dispatch($pesanan->id);
        }

        Log::info("Asynchronous Dispatch Queued: Biteship & Email untuk Order {$pesanan->nomor_pesanan}");
    }
}
