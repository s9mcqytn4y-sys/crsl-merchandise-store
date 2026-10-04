<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\Inventori\Services\InventoriService;
use App\Domains\Pembayaran\Services\MidtransService;
use App\Mail\KonfirmasiPesananMail;
use App\Models\PenggunaLoyalitas;
use App\Models\Pesanan;
use App\Models\RiwayatPoin;
use App\Models\Voucher;
use App\Models\VoucherTerpakai;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        // Identifikasi kandidat nomor pesanan:
        // Format pesanan CRSL: INV/CRSL/YYYYMMDD/XXXX atau INV/CRSL/YYYYMMDD/XXXX-SUFFIX
        // Midtrans mengirim orderId dengan dash (-) sebagai pengganti slash (/)
        $cleanOrderId = preg_replace('/-[AQ]\d+$/i', '', $orderId);
        $cleanOrderIdFallback = preg_replace('/-[A-Za-z0-9]+$/i', '', $orderId);

        // Ubah 3 dash pertama menjadi slash agar suffix seperti -XYZ atau -Q1 tetap utuh
        $slashFirstThree = preg_replace('/^([^-]+)-([^-]+)-([^-]+)-/', '$1/$2/$3/', $orderId);
        $cleanSlashFirstThree = preg_replace('/^([^-]+)-([^-]+)-([^-]+)-/', '$1/$2/$3/', $cleanOrderId);
        $cleanFallbackSlashFirstThree = preg_replace('/^([^-]+)-([^-]+)-([^-]+)-/', '$1/$2/$3/', $cleanOrderIdFallback);
        
        $kandidatNomor = array_unique(array_filter([
            $orderId,
            $slashFirstThree,
            str_replace('-', '/', $orderId),
            $cleanOrderId,
            $cleanSlashFirstThree,
            str_replace('-', '/', $cleanOrderId),
            $cleanOrderIdFallback,
            $cleanFallbackSlashFirstThree,
            str_replace('-', '/', $cleanOrderIdFallback),
        ]));

        $needsSendEmail = false;
        $orderToSend = null;

        try {
            DB::beginTransaction();

            /** @var Pesanan|null $pesanan */
            $pesanan = Pesanan::with(['pengguna', 'pengiriman', 'pembayaran', 'items'])
                ->whereIn('nomor_pesanan', $kandidatNomor)
                ->lockForUpdate()
                ->first();

            if (!$pesanan) {
                DB::rollBack();
                Log::warning("Midtrans Webhook Order Not Found: {$orderId} (Kandidat: " . implode(', ', $kandidatNomor) . ")");
                return response()->json(['sukses' => true, 'pesan' => 'Pesanan tidak ditemukan di database'], 200);
            }

            $pembayaran = $pesanan->pembayaran;

            // 2. Proteksi Integritas Nominal (Anti-Tampering)
            if ((int) round((float) $pesanan->total) !== (int) round((float) $grossAmount)) {
                Log::critical("Midtrans Webhook Amount Mismatch for {$orderId}: DB={$pesanan->total}, Webhook={$grossAmount}");

                $pesanan->status = 'menunggu_verifikasi_manual';
                $pesanan->save();

                if ($pembayaran) {
                    $pembayaran->midtrans_status = 'challenge_amount';
                    $pembayaran->payment_payload = $payload;
                    $pembayaran->save();
                }

                DB::commit();
                return response()->json(['sukses' => true, 'pesan' => 'Mismatch nominal dicatat untuk verifikasi manual'], 200);
            }

            // 3. Cek Idempotensi
            if (in_array($pesanan->status, ['akan_dikirim', 'dikirim', 'selesai', 'dibatalkan', 'expired'])) {
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

                // Update Status Pengiriman Internal
                if ($pesanan->pengiriman) {
                    $pesanan->pengiriman->tracking_status = 'akan_dikirim';
                    $pesanan->pengiriman->save();
                }

                // Tambah Poin Loyalitas Pelanggan (Idempoten via RiwayatPoin)
                if ($pesanan->pengguna_id && $pesanan->poin_didapat > 0) {
                    $sudahDicatat = RiwayatPoin::where('pesanan_id', $pesanan->id)
                        ->where('tipe', RiwayatPoin::TIPE_DIDAPAT)
                        ->exists();

                    if (! $sudahDicatat) {
                        $loyalitas = PenggunaLoyalitas::lockForUpdate()->firstOrCreate(
                            ['pengguna_id' => $pesanan->pengguna_id],
                            ['poin' => 0, 'total_belanja' => 0]
                        );
                        $loyalitas->poin += $pesanan->poin_didapat;
                        $loyalitas->total_belanja += $pesanan->total;
                        $loyalitas->save();

                        RiwayatPoin::create([
                            'pengguna_id' => $pesanan->pengguna_id,
                            'pesanan_id' => $pesanan->id,
                            'tipe' => RiwayatPoin::TIPE_DIDAPAT,
                            'jumlah' => $pesanan->poin_didapat,
                            'saldo_akhir' => $loyalitas->poin,
                            'keterangan' => "Poin reward transaksi {$pesanan->nomor_pesanan}",
                        ]);

                        Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                        Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                    }
                }

                $needsSendEmail = true;
                $orderToSend = $pesanan;

                // B. STATUS FRAUD CHALLENGE
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

                // 1. Rollback Stok
                $itemsArray = $pesanan->items->map(fn($item) => [
                    'varian_id' => $item->produk_varian_id,
                    'jumlah'    => $item->jumlah,
                ])->toArray();

                $this->inventoriService->kembalikanStok($itemsArray);

                // 2. Rollback Poin Loyalitas (Idempoten via RiwayatPoin)
                if ($pesanan->pengguna_id && $pesanan->poin_digunakan > 0) {
                    $sudahDikembalikan = RiwayatPoin::where('pesanan_id', $pesanan->id)
                        ->where('tipe', RiwayatPoin::TIPE_DIKEMBALIKAN)
                        ->exists();

                    if (! $sudahDikembalikan) {
                        $loyalitas = PenggunaLoyalitas::lockForUpdate()->firstOrCreate(
                            ['pengguna_id' => $pesanan->pengguna_id],
                            ['poin' => 0, 'total_belanja' => 0]
                        );
                        $loyalitas->increment('poin', $pesanan->poin_digunakan);

                        RiwayatPoin::create([
                            'pengguna_id' => $pesanan->pengguna_id,
                            'pesanan_id' => $pesanan->id,
                            'tipe' => RiwayatPoin::TIPE_DIKEMBALIKAN,
                            'jumlah' => $pesanan->poin_digunakan,
                            'saldo_akhir' => $loyalitas->poin,
                            'keterangan' => "Pengembalian poin transaksi {$pesanan->nomor_pesanan} ({$pesanan->status})",
                        ]);

                        Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                        Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                    }
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

        // 4. Kirim Email Konfirmasi & Alokasikan Pengiriman Kurir via Biteship Queue
        if ($needsSendEmail && $orderToSend) {
            $this->kirimEmailKonfirmasi($orderToSend);

            try {
                \App\Domains\Pengiriman\Jobs\AlokasiPengirimanBiteshipJob::dispatch((string) $orderToSend->id);
                Log::info("[Midtrans Webhook] Job Alokasi Biteship diantrekan untuk pesanan {$orderToSend->nomor_pesanan}");
            } catch (\Throwable $e) {
                Log::warning("[Midtrans Webhook] Gagal mengantrekan Alokasi Biteship: {$e->getMessage()}");
            }
        }

        return response()->json(['sukses' => true, 'pesan' => 'Webhook berhasil diproses']);
    }

    /**
     * Mengirim email konfirmasi pesanan lunas ke pelanggan.
     */
    protected function kirimEmailKonfirmasi(Pesanan $pesanan): void
    {
        try {
            $savedAddress = is_array($pesanan->pengiriman?->json_payload) ? $pesanan->pengiriman->json_payload : [];
            $targetEmail = $pesanan->pengguna?->email ?? ($savedAddress['email'] ?? null);

            if ($targetEmail) {
                $pesananSegar = Pesanan::with(['pengiriman', 'items.produk'])->find($pesanan->id);
                if ($pesananSegar) {
                    Mail::to($targetEmail)->queue(new KonfirmasiPesananMail($pesananSegar));
                    Log::info("Email Konfirmasi Pembayaran diantrekan untuk {$targetEmail} (Pesanan {$pesanan->nomor_pesanan})");
                }
            }
        } catch (\Throwable $e) {
            Log::warning("Gagal mengirim email konfirmasi pembayaran: {$e->getMessage()}");
        }
    }
}
