<?php

declare(strict_types=1);

// Jalankan hanya melalui php artisan tinker. Tidak menampilkan nilai rahasia.
(function (): void {
    $cetak = static function (string $bagian, mixed $data): void {
        echo json_encode(['bagian' => $bagian, 'data' => $data], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR).PHP_EOL;
    };
    $cetak('lingkungan', [
        'php' => PHP_VERSION,
        'laravel' => app()->version(),
        'lingkungan' => app()->environment(),
        'debug' => config('app.debug'),
        'lokalisasi' => config('app.locale'),
        'zona_waktu' => config('app.timezone'),
        'basis_data' => config('database.default'),
        'cache' => config('cache.default'),
        'koneksi_cache' => config('cache.stores.database.connection') ?? config('database.default'),
        'koneksi_kunci_cache' => config('cache.stores.database.lock_connection') ?? config('cache.stores.database.connection') ?? config('database.default'),
        'sesi' => config('session.driver'),
        'koneksi_sesi' => config('session.connection') ?? config('database.default'),
        'sesi_http_only' => config('session.http_only'),
        'sesi_secure' => config('session.secure'),
        'sesi_same_site' => config('session.same_site'),
        'antrean' => config('queue.default'),
        'antrean_setelah_commit' => config('queue.connections.database.after_commit'),
        'email' => config('mail.default'),
        'midtrans_produksi' => config('services.midtrans.is_production'),
        'midtrans_terkonfigurasi' => filled(config('services.midtrans.server_key')),
        'rajaongkir_terkonfigurasi' => filled(config('services.rajaongkir.api_key')),
        'biteship_terkonfigurasi' => filled(config('services.biteship.api_key')),
        'ekstensi' => array_intersect(['pdo_pgsql', 'pdo_sqlite', 'mbstring', 'openssl'], get_loaded_extensions()),
    ]);
    $daftarPaket = json_decode(file_get_contents(base_path('package-lock.json')), true, flags: JSON_THROW_ON_ERROR);
    foreach (array_keys(array_merge(json_decode(file_get_contents(base_path('package.json')), true)['dependencies'], json_decode(file_get_contents(base_path('package.json')), true)['devDependencies'])) as $nama) {
        $lokasi = base_path('node_modules/'.$nama.'/package.json');
        $cetak('paket', ['nama' => $nama, 'terkunci' => $daftarPaket['packages']['node_modules/'.$nama]['version'] ?? null, 'terpasang' => is_file($lokasi) ? json_decode(file_get_contents($lokasi), true)['version'] : null]);
    }
    try {
        $koneksi = Illuminate\Support\Facades\DB::connection();
        $cetak('versi_basis_data', $koneksi->getDriverName() === 'pgsql' ? $koneksi->selectOne('SHOW server_version')->server_version : $koneksi->getDriverName());
        foreach (['pesanan', 'pesanan_pembayaran', 'item_pesanan', 'produk', 'produk_varian', 'keranjang', 'item_keranjang', 'voucher', 'users', 'jobs', 'failed_jobs'] as $tabel) {
            $cetak('tabel', ['nama' => $tabel, 'jumlah' => $koneksi->table($tabel)->count(), 'kolom' => $koneksi->getSchemaBuilder()->getColumnListing($tabel)]);
        }
        $tercatat = $koneksi->table('migrations')->pluck('migration')->all();
        $berkas = array_map(static fn (string $lokasi): string => pathinfo($lokasi, PATHINFO_FILENAME), glob(database_path('migrations/*.php')));
        $cetak('migrasi_belum_dijalankan', array_values(array_diff($berkas, $tercatat)));
        $cetak('status_pesanan', $koneksi->table('pesanan')->selectRaw('status, count(*) as jumlah')->groupBy('status')->get()->all());
        if ($koneksi->getDriverName() === 'pgsql') {
            $cetak('batasan_integritas', $koneksi->select("SELECT conrelid::regclass::text AS tabel, conname AS nama, pg_get_constraintdef(oid) AS definisi FROM pg_constraint WHERE conrelid IN ('produk_varian'::regclass, 'item_keranjang'::regclass, 'keranjang'::regclass, 'pesanan'::regclass, 'pesanan_pembayaran'::regclass, 'pesanan_pengiriman'::regclass) ORDER BY conrelid::regclass::text, conname"));
        }
        $cache = Illuminate\Support\Facades\Cache::store()->getStore();
        $cetak('penyimpanan_cache', ['kelas' => $cache::class, 'koneksi' => method_exists($cache, 'getConnection') ? $cache->getConnection()->getDriverName() : null]);
        $cetak('sqlite_cache', ['tersedia' => is_file(database_path('cache.sqlite')), 'tabel' => Illuminate\Support\Facades\Schema::connection('cache_sqlite')->getTableListing()]);
    } catch (Throwable $galat) {
        $cetak('kendala_basis_data', ['kelas' => $galat::class, 'kode' => $galat->getCode()]);
    }
    $rute = app('router')->getRoutes();
    foreach (['beranda', 'faktur', 'faktur.simulasi', 'checkout.proses', 'login', 'api.midtrans.webhook'] as $nama) {
        $cetak('rute', ['nama' => $nama, 'middleware' => app('router')->gatherRouteMiddleware($rute->getByName($nama))]);
    }
    $cetak('jadwal', array_map(static fn ($jadwal): array => ['perintah' => $jadwal->command, 'ekspresi' => $jadwal->expression, 'zona_waktu' => $jadwal->timezone], app(Illuminate\Console\Scheduling\Schedule::class)->events()));
})();
