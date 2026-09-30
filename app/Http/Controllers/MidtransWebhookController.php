<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\Inventori\Services\InventoriService;
use App\Domains\Pembayaran\Services\MidtransService;
use App\Domains\Pengiriman\Jobs\AlokasiPengirimanBiteshipJob;
use App\Mail\KonfirmasiPesananMail;
use App\Models\PenggunaLoyalitas;
use App\Models\Pesanan;
use App\Models\PesananPembayaran;
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
        protected MidtransService $midtransService,
        protected InventoriService $inventoriService
    ) {}

    /**
     * Endpoint HTTP POST Webhook Notification dari Midtrans Sandbox/Production.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signatureKey = (string) ($payload['signature_key'] ?? '');
        $transactionStatus = (string) ($payload['transaction_status'] ?? '');
        $fraudStatus = (string) ($payload['fraud_status'] ?? 'accept');

        Log::info("Midtrans Webhook Received: {$orderId}", [
            'status' => $transactionStatus,
            'amount' => $grossAmount,
        ]);

        if (empty($orderId) || empty($signatureKey)) {
            return response()->json(['sukses' => false, 'pesan' => 'Payload tidak lengkap'], 400);
        }

        // 1. Verifikasi Keaslian Signature SHA-512
        if (!$this->midtransService->verifikasiSignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            Log::warning("Midtrans Webhook Invalid Signature: {$orderId}");
            return response()->json(['sukses' => false, 'pesan' => 'Signature Key tidak valid'], 403);
        }

        // Bersihkan suffix attempt (misal: INV-CRSL-20260927-0001-A2 -> INV/CRSL/20260927/0001)
        $cleanOrderId = preg_replace('/-A\d+$/i', '', $orderId);
        $nomorPesananAsli = str_replace('-', '/', $cleanOrderId);

        $needsDispatchShipping = false;
        $orderToDispatch = null;

        try {
            DB::beginTransaction();

            /** @var Pesanan|null $pesanan */
            $pesanan = Pesanan::with(['pengguna', 'pengiriman', 'pembayaran', 'items'])
                ->where('nomor_pesanan', $nomorPesananAsli)
                ->orWhere('nomor_pesanan', $cleanOrderId)
                ->orWhere('nomor_pesanan', $orderId)
                ->lockForUpdate()
                ->first();

            if (!$pesanan) {
                DB::rollBack();
                Log::warning("Midtrans Webhook Order Not Found: {$orderId} (Raw: {$nomorPesananAsli})");
                // Beri HTTP 200 agar Midtrans tidak terus melakukan retry untuk order yang tidak terdaftar
                return response()->json(['sukses' => true, 'pesan' => 'Pesanan tidak ditemukan di database'], 200);
            }

            $pembayaran = $pesanan->pembayaran;

            // 2. Proteksi Integritas Nominal (Anti-Tampering)
            if ((int) round((float) $pesanan->total) !== (int) round((float) $grossAmount)) {
                Log::critical("Midtrans Webhook Amount Mismatch for {$orderId}: DB={$pesanan->total}, Webhook={$grossAmount}");

                // Jangan rollback, ubah status ke antrean audit admin
                $pesanan->status = 'menunggu_verifikasi_manual';
                $pesanan->save();

                if ($pembayaran) {
                    $pembayaran->midtrans_status = 'challenge_amount';
                    $pembayaran->payment_payload = $payload;
                    $pembayaran->save();
                }

                DB::commit();

                // Kembalikan 200 agar Midtrans berhenti retry, namun sistem internal tahu statusnya tertahan
                return response()->json(['sukses' => true, 'pesan' => 'Mismatch nominal dicatat untuk verifikasi manual'], 200);
            }

            // 3. Cek Idempotensi
            if (in_array($pesanan->status, ['akan_dikirim', 'dikirim', 'selesai', 'dibatalkan'])) {
                DB::rollBack();
                return response()->json(['sukses' => true, 'pesan' => 'Pesanan sudah berada di status terminal']);
            }

            // A. STATUS SUKSES (Settlement / Capture Accept)
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

            // B. STATUS FRAUD CHALLENGE (Perlu Review Manual)
            } elseif ($fraudStatus === 'challenge') {
                $pesanan->status = 'menunggu_verifikasi_manual';
                $pesanan->save();

                if ($pembayaran) {
                    $pembayaran->midtrans_status = 'challenge';
                    $pembayaran->payment_payload = $payload;
                    $pembayaran->save();
                }

            // C. STATUS PENDING
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

            // D. STATUS BATAL / EXPIRED / DENIED
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
                $pesanan->status = ($transactionStatus === 'expire') ? 'expired' : 'dibatalkan';
                $pesanan->save();

                if ($pembayaran) {
                    $pembayaran->midtrans_status = $transactionStatus;
                    $pembayaran->payment_payload = $payload;
                    $pembayaran->save();
                }

                // 1. Rollback Stok menggunakan InventoriService
                $itemsArray = $pesanan->items->map(fn($item) => [
                    'varian_id' => $item->produk_varian_id,
                    'jumlah'    => $item->jumlah,
                ])->toArray();

                $this->inventoriService->kembalikanStok($itemsArray);

                // 2. Rollback Poin Loyalitas
                if ($pesanan->pengguna_id && $pesanan->poin_digunakan > 0) {
                    $loyalitas = PenggunaLoyalitas::firstOrCreate(
                        ['pengguna_id' => $pesanan->pengguna_id],
                        ['poin' => 0, 'total_belanja' => 0]
                    );
                    $loyalitas->increment('poin', $pesanan->poin_digunakan);
                    Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                    Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                }

                // 3. Rollback Kuota Voucher
                if ($pesanan->kode_voucher) {
                    Voucher::where('kode', $pesanan->kode_voucher)->increment('kuota', 1);
                    VoucherTerpakai::where('pesanan_id', $pesanan->id)->delete();
                }
            }

            DB::commit();

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Midtrans Webhook DB Exception: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['sukses' => false, 'pesan' => 'Terjadi kesalahan sistem internal'], 500);
        }

        // 4. Dispatch Asynchronous Queue Job (Biteship & Email) di Luar Transaksi DB
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
            AlokasiPengirimanBiteshipJob::dispatch($pesanan->id);
        }

        Log::info("Asynchronous Dispatch Queued: Biteship & Email untuk Order {$pesanan->nomor_pesanan}");
    }
}
