# Aturan Pengujian (Testing Rules) — CRSL Store v2

Pengujian yang andal menjamin kestabilan dan integritas sistem sebelum kode dirilis ke lingkungan produksi.

## 1. Siklus TDD (Test-Driven Development)
- Tahapan siklus:
  1. **RED**: Tuliskan test case di `tests/Feature/` atau `tests/Unit/` yang mendefinisikan ekspektasi perilaku dan pastikan test gagal sebelum fitur dikembangkan.
  2. **GREEN**: Implementasikan kode minimal di Model, Controller, atau Komponen React hingga test lulus.
  3. **REFACTOR**: Bersihkan struktur kode, rapikan penamaan Bahasa Indonesia, dan optimalkan performa tanpa mematahkan test.

## 2. Pengujian Backend Laravel
- Jalankan test suite bawaan Laravel menggunakan perintah:
  ```powershell
  php artisan test
  ```
- Verifikasi bahwa seluruh Feature Test (Checkout, Katalog, Keranjang, Midtrans Webhook, Biteship Rate Calculation) lulus 100%.

## 3. Build & Type Checking Frontend
- Sebelum commit, jalankan pengujian build frontend untuk memastikan tidak ada kesalahan TypeScript atau Vite import error:
  ```powershell
  npm run build
  ```
- Pastikan tidak ada runtime error pada browser console saat halaman diakses.

## 4. Pengujian Antarmuka Pengguna & Responsivitas
- Uji alur antarmuka pada viewport mobile (375px), tablet (768px), dan desktop (1280px).
- Uji edge cases:
  - Keranjang belanja kosong (*empty cart drawer*).
  - Produk berstatus Sold Out / Stok Varian Habis.
  - Form checkout dengan data pengiriman tidak lengkap.
  - Status faktur pesanan dan nomor resi pengiriman Biteship.
