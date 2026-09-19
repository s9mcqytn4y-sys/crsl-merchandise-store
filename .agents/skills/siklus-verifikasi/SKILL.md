---
name: siklus-verifikasi
description: Prosedur verifikasi loop otomatis sebelum penyelesaian tugas, mencakup sintaks PHP, status HTTP, bebas em dash, dan responsivitas layout.
---

# Skill: Siklus Verifikasi (Verification Loop)

Gunakan skill ini sebelum menyatakan suatu tugas selesai atau sebelum melakukan commit ke git.

## Tahapan Verifikasi Wajib

### 1. Pengecekan Sintaksis PHP (`php -l`)
Jalankan linting sintaks untuk seluruh berkas PHP yang dimodifikasi:
```bash
php -l publik/index.php
php -l publik/halaman/*.php
php -l src/**/*.php
```
Pastikan seluruh berkas menghasilkan: `No syntax errors detected in <berkas>`.

### 2. Pengecekan Respons HTTP Server
Pastikan server lokal (`http://127.0.0.1:8000`) memberikan respons status `200 OK`:
```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/products
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/akun
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/robots.txt
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/sitemap.xml
```

### 3. Pengecekan Karakter Terlarang (Zero Em Dash)
Pastikan tidak ada karakter em dash (`—`) di dalam kode sumber:
```bash
# Menggunakan ripgrep
rg "—" publik/ src/
```
Jika tidak ada output, berarti kode telah bersih dari em dash.

### 4. Pengecekan Integritas Versi Git
Jalankan `git status -s` untuk memastikan hanya berkas yang relevan yang dimodifikasi dan siap di-commit.
