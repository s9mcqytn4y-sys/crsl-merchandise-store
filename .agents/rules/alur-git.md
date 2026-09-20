# Aturan Alur Git (Git Workflow Rules) — CRSL Store v2

Panduan ini mengatur disiplin pengelolaan versi menggunakan git agar riwayat perubahan rapi, mudah ditelusuri, dan aman dari regresi.

## 1. Bahasa & Format Pesan Commit
- **Wajib Bahasa Indonesia**: Seluruh pesan commit wajib ditulis dalam Bahasa Indonesia yang jelas, singkat, dan deskriptif.
- Gunakan struktur Conventional Commits:
  - `feat:` Penambahan fitur baru untuk pengguna.
  - `fix:` Perbaikan bug atau kendala teknis.
  - `refactor:` Restrukturisasi kode tanpa mengubah fungsionalitas eksternal.
  - `docs:` Pembaruan atau penambahan dokumentasi/walkthrough.
  - `test:` Penambahan atau perbaikan skrip pengujian.
  - `chore:` Pemeliharaan dependensi, konfigurasi git, atau pembersihan rutin.
- Contoh pesan commit yang baik:
  - `feat: implementasi state keranjang zustand dan animasi drawer gsap 3`
  - `fix: sesuaikan koneksi pdo_pgsql dan skema PostgreSQL crsl_store_v2`
  - `docs: perbarui panduan agen dan aturan arsitektur laravel 13.x`

## 2. Prinsip Perubahan Atomik (Atomic Commits)
- Pisahkan perubahan besar menjadi beberapa commit kecil yang logis.
- Jangan menggabungkan refactoring format kode besar-besaran dengan penambahan logika bisnis baru dalam satu commit yang sama.
- Pastikan setiap commit berada dalam kondisi sehat (`npm run build` dan `php artisan test` lulus).

## 3. Checklist Sebelum Commit & Push
Sebelum melakukan `git commit` dan `git push`:
1. Jalankan `git status -s` untuk meninjau berkas staging.
2. Pastikan tidak ada kredensial atau `.env` yang tidak sengaja ter-commit.
3. Jalankan `npm run build` untuk memastikan aset frontend terkompilasi bersih.
4. Pastikan kode bebas dari em dash (`—`).
