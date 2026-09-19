# Aturan Performa & Basis Data (Performance & Database Rules) - CRSL Merchandise Store

Aturan keandalan sistem backend, pengelolaan memori, dan efisiensi basis data SQLite.

## 1. Standar Konkurensi & Keandalan SQLite
Pada setiap inisialisasi koneksi PDO SQLite, wajib mengeksekusi tiga instruksi PRAGMA berikut:
```php
$pdo->exec("PRAGMA journal_mode = WAL;");
$pdo->exec("PRAGMA synchronous = NORMAL;");
$pdo->exec("PRAGMA busy_timeout = 5000;");
$pdo->exec("PRAGMA foreign_keys = ON;");
```
- **WAL (Write-Ahead Logging)**: Mengizinkan pembacaan paralel bersamaan dengan operasi penulisan tanpa lock saling tunggu.
- **Synchronous NORMAL**: Memberikan performa tulis tinggi dengan jaminan integritas data yang aman pada mode WAL.
- **Busy Timeout 5000**: Menunggu hingga 5 detik sebelum melempar exception `database is locked` ketika terjadi konkurensi tinggi.
- **Foreign Keys ON**: Memastikan integritas referensial antar tabel tetap terjaga.

## 2. Pengelolaan Memori & Siklus Hidup Koneksi
- Panggil `PengelolaDatabase::tutupKoneksi()` pada akhir eksekusi skrip CLI berat, skrip migrasi, atau seeder data.
- Gunakan paginasi atau limit query pada tabel besar (`pesanan`, `log_aktivitas`) agar tidak memuat seluruh baris data ke dalam memori PHP sekaligus.

## 3. Higienitas Aset & Optimasi Frontend
- **Format Aset**: Utamakan format WebP untuk foto produk dan SVG untuk ikon navigasi.
- **Dimensi & SEO**: Setiap tag `<img>` wajib memiliki atribut `alt` deskriptif, serta `width` dan `height` eksplisit untuk mencegah Cumulative Layout Shift (CLS).
- **Zero Dead Assets**: Jangan ada pemanggilan file gambar atau ikon yang menghasilkan status 404.
- **Hover Intent Prefetching**: Gunakan prefetching cerdas untuk rute navigasi berikutnya saat cursor pengguna melayang di atas tautan menu.

## 4. Kompatibilitas CSS Modern
- Bungkus properti scrollbar modern dalam `@supports (scrollbar-width: ...)`:
  ```css
  @supports (scrollbar-width: none) {
    .container-halus {
      scrollbar-width: none;
    }
  }
  ```
- Selalu sediakan fallback standar dan hindari vendor-prefix yatim tanpa padanan standar W3C.
