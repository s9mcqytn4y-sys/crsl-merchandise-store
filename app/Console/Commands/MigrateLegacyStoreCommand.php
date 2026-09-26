<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PDO;
use Throwable;

class MigrateLegacyStoreCommand extends Command
{
    protected $signature = 'store:migrate-legacy {--source= : Jalur file SQLite toko.db legacy}';
    protected $description = 'Migrasi data produk, kategori, varian, gambar, spesifikasi, dan voucher dari toko.db legacy ke PostgreSQL V2';

    /**
     * Peta ID Kategori [legacyId => v2Id]
     * @var array<int, int>
     */
    protected array $kategoriMap = [];

    /**
     * Peta ID Produk [legacyId => v2Id]
     * @var array<int, int>
     */
    protected array $produkMap = [];

    public function handle(): int
    {
        $sourcePath = $this->option('source') ?: 'C:/Projects/merchandise-store/data/toko.db';

        if (!file_exists($sourcePath)) {
            $this->error("File basis data legacy tidak ditemukan di: {$sourcePath}");
            return self::FAILURE;
        }

        $this->info("=== Memulai Migrasi Data Legacy CRSL Store ===");
        $this->line("Sumber: <comment>{$sourcePath}</comment>");
        $this->line("Target: <comment>" . config('database.default') . " / " . config('database.connections.pgsql.database') . "</comment>");

        try {
            $sqlite = new PDO("sqlite:{$sourcePath}");
            $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sqlite->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            DB::beginTransaction();

            // Sinkronkan sequence PostgreSQL terlebih dahulu agar nextval() tidak bertabrakan
            $this->resetSequences();

            // 1. Migrasi Kategori
            $totalKategori = $this->migrasiKategori($sqlite);
            $this->info("✓ Kategori termigrasi: {$totalKategori}");

            // 2. Migrasi Produk
            $totalProduk = $this->migrasiProduk($sqlite);
            $this->info("✓ Produk termigrasi: {$totalProduk}");

            // 3. Migrasi Galeri Gambar Produk
            $totalGambar = $this->migrasiGambarProduk($sqlite);
            $this->info("✓ Galeri Gambar termigrasi: {$totalGambar}");

            // 4. Migrasi Varian Produk
            $totalVarian = $this->migrasiProdukVarian($sqlite);
            $this->info("✓ Varian Produk termigrasi: {$totalVarian}");

            // 5. Migrasi Spesifikasi Produk
            $totalSpesifikasi = $this->migrasiSpesifikasiProduk($sqlite);
            $this->info("✓ Spesifikasi Produk termigrasi: {$totalSpesifikasi}");

            // 6. Migrasi Voucher
            $totalVoucher = $this->migrasiVoucher($sqlite);
            $this->info("✓ Voucher diskon termigrasi: {$totalVoucher}");

            // 7. Reset Sequence PostgreSQL
            $this->resetSequences();
            $this->info("✓ PostgreSQL sequence terkalibrasi aman");

            DB::commit();

            $this->newLine();
            $this->info("🎉 Seluruh data legacy berhasil dimigrasikan ke PostgreSQL V2 dengan sukses!");
            return self::SUCCESS;
        } catch (Throwable $e) {
            DB::rollBack();
            $this->error("Gagal melakukan migrasi data legacy: " . $e->getMessage());
            $this->line($e->getTraceAsString());
            return self::FAILURE;
        }
    }

    protected function migrasiKategori(PDO $sqlite): int
    {
        $stmt = $sqlite->query("SELECT * FROM kategori ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        $count = 0;

        foreach ($rows as $row) {
            $legacyId = (int) $row['id'];
            $slug = (string) $row['slug'];

            $existing = DB::table('kategori')->where('slug', $slug)->first();

            $payload = [
                'nama'       => (string) $row['nama'],
                'slug'       => $slug,
                'deskripsi'  => $row['deskripsi'] ?? null,
                'emoji'      => $row['emoji'] ?? '✨',
                'urutan'     => (int) ($row['urutan'] ?? 0),
                'aktif'      => (bool) ($row['aktif'] ?? 1),
                'updated_at' => now(),
            ];

            if ($existing) {
                DB::table('kategori')->where('id', $existing->id)->update($payload);
                $this->kategoriMap[$legacyId] = (int) $existing->id;
            } else {
                $payload['created_at'] = $row['dibuat_pada'] ?? now();
                $newId = DB::table('kategori')->insertGetId($payload);
                $this->kategoriMap[$legacyId] = (int) $newId;
            }
            $count++;
        }

        return $count;
    }

    protected function migrasiProduk(PDO $sqlite): int
    {
        $stmt = $sqlite->query("SELECT * FROM produk ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        $count = 0;

        foreach ($rows as $row) {
            $legacyId = (int) $row['id'];
            $slug = (string) $row['slug'];

            $gambarUtama = (string) ($row['gambar_utama'] ?? '');
            if (!empty($gambarUtama) && !str_starts_with($gambarUtama, '/')) {
                $gambarUtama = '/' . $gambarUtama;
            }

            $legacyKategoriId = !empty($row['kategori_id']) ? (int) $row['kategori_id'] : null;
            $v2KategoriId = $legacyKategoriId && isset($this->kategoriMap[$legacyKategoriId])
                ? $this->kategoriMap[$legacyKategoriId]
                : $legacyKategoriId;

            // Pastikan kategori valid
            if ($v2KategoriId && !DB::table('kategori')->where('id', $v2KategoriId)->exists()) {
                $v2KategoriId = null;
            }

            $existing = DB::table('produk')->where('slug', $slug)->first();

            $payload = [
                'kategori_id'    => $v2KategoriId,
                'nama'           => (string) $row['nama'],
                'slug'           => $slug,
                'deskripsi'      => $row['deskripsi'] ?? null,
                'harga_dasar'    => (float) ($row['harga'] ?? 0),
                'harga_diskon'   => !empty($row['harga_diskon']) ? (float) $row['harga_diskon'] : null,
                'stok_total'     => (int) ($row['stok'] ?? 10),
                'berat_gram'     => (int) ($row['berat'] ?? 250),
                'tipe_produk'    => (string) ($row['tipe_produk'] ?? 'regular'),
                'estimasi_po'    => $row['estimasi_po'] ?? null,
                'status_stok'    => (string) ($row['status_stok'] ?? 'in_stock'),
                'terjual'        => (int) ($row['terjual'] ?? 0),
                'is_best_seller' => (bool) ($row['is_best_seller'] ?? 0),
                'gambar_utama'   => $gambarUtama ?: '/assets/gambar/banner-bts.webp',
                'aktif'          => (bool) ($row['aktif'] ?? 1),
                'updated_at'     => $row['diperbarui_pada'] ?? now(),
            ];

            if ($existing) {
                DB::table('produk')->where('id', $existing->id)->update($payload);
                $this->produkMap[$legacyId] = (int) $existing->id;
            } else {
                $payload['created_at'] = $row['dibuat_pada'] ?? now();
                $newId = DB::table('produk')->insertGetId($payload);
                $this->produkMap[$legacyId] = (int) $newId;
            }
            $count++;
        }

        return $count;
    }

    protected function migrasiGambarProduk(PDO $sqlite): int
    {
        $stmt = $sqlite->query("SELECT * FROM gambar_produk ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        $count = 0;

        foreach ($rows as $row) {
            $legacyProdukId = (int) $row['produk_id'];
            if (!isset($this->produkMap[$legacyProdukId])) {
                continue;
            }

            $v2ProdukId = $this->produkMap[$legacyProdukId];
            $url = (string) ($row['url'] ?? '');
            if (!empty($url) && !str_starts_with($url, '/')) {
                $url = '/' . $url;
            }

            $existing = DB::table('gambar_produk')
                ->where('produk_id', $v2ProdukId)
                ->where('url', $url)
                ->first();

            $payload = [
                'produk_id'  => $v2ProdukId,
                'url'        => $url,
                'alt_teks'   => $row['alt_teks'] ?? null,
                'urutan'     => (int) ($row['urutan'] ?? 0),
                'updated_at' => now(),
            ];

            if ($existing) {
                DB::table('gambar_produk')->where('id', $existing->id)->update($payload);
            } else {
                $payload['created_at'] = now();
                DB::table('gambar_produk')->insert($payload);
            }
            $count++;
        }

        return $count;
    }

    protected function migrasiProdukVarian(PDO $sqlite): int
    {
        $stmt = $sqlite->query("SELECT * FROM produk_varian ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        $count = 0;

        foreach ($rows as $row) {
            $legacyProdukId = (int) $row['produk_id'];
            if (!isset($this->produkMap[$legacyProdukId])) {
                continue;
            }

            $v2ProdukId = $this->produkMap[$legacyProdukId];
            $sku = (string) ($row['sku'] ?? ('CRSL-VAR-' . $row['id']));

            $gambarVarian = $row['gambar_varian'] ?? null;
            if (!empty($gambarVarian) && !str_starts_with($gambarVarian, '/')) {
                $gambarVarian = '/' . $gambarVarian;
            }

            $existing = DB::table('produk_varian')->where('sku', $sku)->first();

            $payload = [
                'produk_id'      => $v2ProdukId,
                'sku'            => $sku,
                'nama_varian'    => (string) ($row['nama_varian'] ?? 'Default'),
                'tipe_varian'    => (string) ($row['tipe_varian'] ?? 'warna'),
                'warna'          => $row['warna'] ?? null,
                'warna_hex'      => $row['warna_hex'] ?? null,
                'warna_gambar'   => $row['warna_gambar'] ?? null,
                'ukuran'         => $row['ukuran'] ?? ($row['atribut_ukuran'] ?? null),
                'harga_tambahan' => (float) ($row['harga_tambahan'] ?? 0),
                'stok'           => (int) ($row['stok'] ?? 10),
                'gambar_varian'  => $gambarVarian,
                'aktif'          => (bool) ($row['aktif'] ?? 1),
                'updated_at'     => now(),
            ];

            if ($existing) {
                DB::table('produk_varian')->where('id', $existing->id)->update($payload);
            } else {
                $payload['created_at'] = $row['dibuat_pada'] ?? now();
                DB::table('produk_varian')->insert($payload);
            }
            $count++;
        }

        return $count;
    }

    protected function migrasiSpesifikasiProduk(PDO $sqlite): int
    {
        $stmt = $sqlite->query("SELECT * FROM produk_spesifikasi ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        $count = 0;

        foreach ($rows as $row) {
            $legacyProdukId = (int) $row['produk_id'];
            if (!isset($this->produkMap[$legacyProdukId])) {
                continue;
            }

            $v2ProdukId = $this->produkMap[$legacyProdukId];
            $kunci = (string) $row['kunci'];

            $existing = DB::table('produk_spesifikasi')
                ->where('produk_id', $v2ProdukId)
                ->where('kunci', $kunci)
                ->first();

            $payload = [
                'produk_id'  => $v2ProdukId,
                'kunci'      => $kunci,
                'nilai'      => (string) ($row['nilai'] ?? ''),
                'urutan'     => (int) ($row['urutan'] ?? 0),
                'updated_at' => now(),
            ];

            if ($existing) {
                DB::table('produk_spesifikasi')->where('id', $existing->id)->update($payload);
            } else {
                $payload['created_at'] = now();
                DB::table('produk_spesifikasi')->insert($payload);
            }
            $count++;
        }

        return $count;
    }

    protected function migrasiVoucher(PDO $sqlite): int
    {
        $stmt = $sqlite->query("SELECT * FROM voucher ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        $count = 0;

        foreach ($rows as $row) {
            $kode = (string) $row['kode'];
            $existing = DB::table('voucher')->where('kode', $kode)->first();

            $payload = [
                'kode'           => $kode,
                'judul'          => (string) ($row['judul'] ?? 'Voucher Promo CRSL'),
                'tipe'           => (string) ($row['tipe'] ?? 'nominal'),
                'nilai'          => (float) ($row['nilai'] ?? 0),
                'min_belanja'    => (float) ($row['min_belanja'] ?? 0),
                'syarat_kurir'   => (string) ($row['syarat_kurir'] ?? 'all'),
                'kuota'          => (int) ($row['kuota'] ?? 1000),
                'berlaku_dari'   => $row['berlaku_dari'] ?? null,
                'berlaku_sampai' => $row['berlaku_sampai'] ?? null,
                'aktif'          => (bool) ($row['aktif'] ?? 1),
                'updated_at'     => now(),
            ];

            if ($existing) {
                DB::table('voucher')->where('id', $existing->id)->update($payload);
            } else {
                $payload['created_at'] = now();
                DB::table('voucher')->insert($payload);
            }
            $count++;
        }

        return $count;
    }

    protected function resetSequences(): void
    {
        $tables = [
            'kategori',
            'produk',
            'gambar_produk',
            'produk_varian',
            'produk_spesifikasi',
            'voucher',
        ];

        foreach ($tables as $table) {
            try {
                $maxId = DB::table($table)->max('id') ?: 0;
                $seq = DB::selectOne("SELECT pg_get_serial_sequence('{$table}', 'id') as seq")?->seq;
                if ($seq && $maxId > 0) {
                    DB::statement("SELECT setval('{$seq}', {$maxId}, true)");
                }
            } catch (Throwable) {
                // Abaikan jika bukan sequence serial standar
            }
        }
    }
}
