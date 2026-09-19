# Aturan Alur Git (Git Workflow Rules) - CRSL Merchandise Store

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
  - `feat: implementasi filter varian warna dan ukuran pada halaman katalog`
  - `fix: tangani pembatasan status kedaluwarsa pesanan pada sqlite check constraint`
  - `docs: perbarui walkthrough integrasi alur checkout dan invoice digital`

## 2. Prinsip Perubahan Atomik (Atomic Commits)
- Pisahkan perubahan besar menjadi beberapa commit kecil yang logis.
- Jangan menggabungkan refactoring format kode besar-besaran dengan penambahan logika bisnis baru dalam satu commit yang sama.
- Pastikan setiap commit berada dalam kondisi sehat (aplikasi dapat dijalankan dan pengujian lulus).

## 3. Checklist Sebelum Commit
Sebelum menjalankan `git commit`, pastikan:
1. Menjalankan `git status -s` untuk meninjau berkas yang dimodifikasi atau belum terlacak.
2. Tidak ada berkas sementara, cache, atau berkas rahasia (`.env`, kredensial) yang tidak sengaja masuk ke area staging.
3. Seluruh berkas PHP lulus pengujian sintaks `php -l`.
4. Kode telah bebas dari tanda baca em dash (`—`).
