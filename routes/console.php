<?php

use App\Console\Commands\PesananMaintenanceCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// -----------------------------------------------------------------------
// CRSL Scheduled Jobs
// -----------------------------------------------------------------------

/**
 * Pesanan Maintenance: Expire kadaluarsa + kembalikan stok + bersihkan cache
 * Berjalan setiap 15 menit, overlap-safe (lock via cache)
 */
Schedule::command(PesananMaintenanceCommand::class)
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/crsl-maintenance.log'));

/**
 * Cleanup Cache SQLite: Hapus entry cache yang sudah expired dari database cache
 * Berjalan setiap hari jam 02:00 WIB (UTC+7 = 19:00 UTC)
 */
Schedule::command('cache:prune-stale-tags')
    ->dailyAt('19:00')
    ->withoutOverlapping();

/**
 * Regenerasi sitemap (opsional - aktifkan jika ada paket sitemap)
 * Schedule::command('sitemap:generate')->weekly();
 */
