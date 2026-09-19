# Aturan Pengujian (Testing Rules) - CRSL Merchandise Store

Pengujian yang andal menjamin kestabilan dan integritas sistem sebelum kode dirilis ke lingkungan produksi.

## 1. Siklus TDD (Test-Driven Development)
- Tuliskan skenario pengujian atau uji coba terlebih dahulu sebelum mengimplementasikan fungsi baru atau memperbaiki bug kritis.
- Tahapan siklus:
  1. **RED**: Buat skenario pengujian yang mendefinisikan ekspektasi perilaku dan pastikan pengujian gagal sebelum perbaikan dilakukan.
  2. **GREEN**: Tuliskan implementasi kode seminimal mungkin untuk membuat pengujian lulus.
  3. **REFACTOR**: Bersihkan struktur kode, hilangkan duplikasi, dan optimalkan performa tanpa merusak hasil pengujian.

## 2. Pengujian Sintaksis & Linting
- Sebelum menyelesaikan perubahan berkas PHP, wajib menjalankan validasi sintaks:
  ```bash
  php -l <path-ke-berkas.php>
  ```
- Pastikan tidak ada Notice, Warning, atau Fatal Error pada runtime server.

## 3. Pengujian API & Backend (CLI Script)
- Letakkan skrip pengujian atau verifikasi sementara di dalam folder `scratch/` (misalnya `scratch/uji_pesanan_e2e.php`).
- Verifikasi hal-hal berikut pada setiap endpoint API:
  - Header respon mengembalikan `Content-Type: application/json`.
  - Status HTTP sesuai standar (200 OK, 400 Bad Request, 404 Not Found, 422 Unprocessable Entity, 500 Server Error).
  - Skema JSON memuat kunci `sukses` (boolean), `data` (payload), atau `pesan` (keterangan error).
  - Integritas data di SQLite: relasi foreign key valid dan data tercatat akurat.

## 4. Pengujian Antarmuka Pengguna & Responsivitas
- Uji alur antarmuka pada viewport mobile (375px), tablet (768px), dan desktop (1280px).
- Pastikan interaktivitas JavaScript berjalan mulus tanpa runtime console error.
- Uji edge cases:
  - Keranjang belanja kosong.
  - Produk berstatus Sold Out / Stok Habis.
  - Form checkout dengan data tidak lengkap atau nomor telepon salah.
  - Batas kedaluwarsa pesanan (countdown timer).
