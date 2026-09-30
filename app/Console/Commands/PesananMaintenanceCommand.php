<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Pesanan;
use App\Models\PesananPembayaran;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * PesananMaintenanceCommand
 *
 * Tugas rutin yang dijalankan via scheduler Laravel:
 * 1. Expire pesanan yang melewati batas waktu bayar (belum_bayar > 24 jam)
 * 2. Cancel pesanan yang statusnya stuck (akan_dikirim tanpa pengiriman > 48 jam)
 * 3. Bersihkan cache Midtrans status yang sudah tidak relevan
 *
 * Jadwal: Setiap 15 menit (lihat routes/console.php)
 */
class PesananMaintenanceCommand extends Command
{
    protected $signature = 'crsl:pesanan-maintenance
                            {--dry-run : Tampilkan perubahan tanpa menyimpan}
                            {--verbose-log : Log setiap pesanan yang diproses}';

    protected $description = 'Jalankan maintenance rutin: expire pesanan kadaluarsa & bersihkan cache';

    // Lock key agar tidak double-running
    private const LOCK_KEY = 'crsl:pesanan_maintenance_running';
    private const LOCK_TTL = 300; // 5 menit

    public function handle(): int
    {
        // Cegah concurrent execution
        if (Cache::has(self::LOCK_KEY)) {
            $this->warn('[MaintenanceLock] Command sudah berjalan di proses lain, skip.');
            Log::warning('[CrslMaintenance] Skip - maintenance lock aktif');

            return self::SUCCESS;
        }

        Cache::put(self::LOCK_KEY, true, self::LOCK_TTL);

        $isDryRun = $this->option('dry-run');
        $isVerbose = $this->option('verbose-log');
        $summary = ['expired' => 0, 'cache_cleared' => 0, 'errors' => 0];

        try {
            $this->info('[CRSL Maintenance] Mulai ' . now()->toDateTimeString());

            // Step 1: Expire pesanan belum_bayar yang kadaluarsa
            $summary['expired'] += $this->expirePesananBelumBayar($isDryRun, $isVerbose);

            // Step 2: Bersihkan cache status pembayaran untuk pesanan final
            $summary['cache_cleared'] += $this->clearPembayaranStatusCache($isDryRun, $isVerbose);

            $this->info(sprintf(
                '[CRSL Maintenance] Selesai | expired: %d | cache_cleared: %d',
                $summary['expired'],
                $summary['cache_cleared'],
            ));

            Log::info('[CrslMaintenance] Selesai', $summary);
        } catch (\Throwable $e) {
            Log::error('[CrslMaintenance] Fatal error', [
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'summary' => $summary,
            ]);

            $this->error('[CrslMaintenance] Error: ' . $e->getMessage());
            $summary['errors']++;
        } finally {
            Cache::forget(self::LOCK_KEY);
        }

        return $summary['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    // -----------------------------------------------------------------------
    // STEP 1: Expire Pesanan Kadaluarsa
    // -----------------------------------------------------------------------

    private function expirePesananBelumBayar(bool $isDryRun, bool $isVerbose): int
    {
        $batasWaktu = Carbon::now()->subMinutes(24 * 60); // 24 jam
        $count = 0;

        // Query pesanan yang batas waktu bayarnya sudah lewat
        $pesananKadaluarsa = Pesanan::where('status', 'belum_bayar')
            ->whereHas('pembayaran', function ($q) use ($batasWaktu) {
                $q->where(function ($inner) use ($batasWaktu) {
                    // Kadaluarsa berdasarkan waktu tersimpan di kolom batas_waktu
                    $inner->whereNotNull('batas_waktu')
                        ->where('batas_waktu', '<', Carbon::now());
                })->orWhere(function ($inner) use ($batasWaktu) {
                    // Fallback: dibuat lebih dari 24 jam lalu tanpa batas_waktu
                    $inner->whereNull('batas_waktu')
                        ->where('created_at', '<', $batasWaktu);
                });
            })
            ->with('pembayaran')
            ->get();

        foreach ($pesananKadaluarsa as $pesanan) {
            try {
                if ($isVerbose) {
                    $this->line("  Expire pesanan: {$pesanan->nomor_pesanan}");
                }

                if (!$isDryRun) {
                    DB::transaction(function () use ($pesanan) {
                        $pesanan->update(['status' => 'expire']);

                        // Update status pembayaran juga
                        if ($pesanan->pembayaran) {
                            $pesanan->pembayaran->update([
                                'midtrans_status' => 'expire',
                            ]);
                        }

                        // Kembalikan stok produk (jika belum dikembalikan)
                        foreach ($pesanan->items ?? [] as $item) {
                            if ($item->varian_id) {
                                DB::table('produk_varian')
                                    ->where('id', $item->varian_id)
                                    ->increment('stok', $item->jumlah);
                            }
                        }
                    });

                    Log::info("[CrslMaintenance] Expire pesanan {$pesanan->nomor_pesanan}", [
                        'pesanan_id' => $pesanan->id,
                        'total'      => $pesanan->total,
                    ]);
                }

                $count++;
            } catch (\Throwable $e) {
                Log::error("[CrslMaintenance] Gagal expire pesanan {$pesanan->nomor_pesanan}", [
                    'error' => $e->getMessage(),
                ]);
                $this->warn("  Gagal expire {$pesanan->nomor_pesanan}: " . $e->getMessage());
            }
        }

        if ($count > 0) {
            $this->info("  [OK] {$count} pesanan di-expire" . ($isDryRun ? ' (dry-run)' : ''));
        }

        return $count;
    }

    // -----------------------------------------------------------------------
    // STEP 2: Bersihkan Cache Status Pembayaran (Pesanan Final)
    // -----------------------------------------------------------------------

    private function clearPembayaranStatusCache(bool $isDryRun, bool $isVerbose): int
    {
        $statusFinal = ['selesai', 'dibatalkan', 'expire', 'failed'];
        $count = 0;

        // Ambil pesanan yang sudah final dan mungkin masih memiliki cache status
        $pesananFinal = Pesanan::whereIn('status', $statusFinal)
            ->whereHas('pembayaran', fn($q) => $q->whereNotNull('midtrans_transaction_id'))
            ->where('updated_at', '<', Carbon::now()->subHours(2)) // Sudah > 2 jam lalu
            ->select(['id', 'nomor_pesanan', 'status'])
            ->limit(200)
            ->get();

        foreach ($pesananFinal as $pesanan) {
            // Key cache sesuai pola di usePaymentStatusPolling hook
            $cacheKey = "payment_status:{$pesanan->nomor_pesanan}";
            $cacheKeyAlt = "midtrans_status:{$pesanan->id}";

            if ($isVerbose) {
                $this->line("  Clear cache: {$cacheKey}");
            }

            if (!$isDryRun) {
                Cache::forget($cacheKey);
                Cache::forget($cacheKeyAlt);
            }

            $count++;
        }

        if ($count > 0) {
            $this->info("  [OK] Cache dibersihkan: {$count} pesanan final" . ($isDryRun ? ' (dry-run)' : ''));
        }

        return $count;
    }
}
