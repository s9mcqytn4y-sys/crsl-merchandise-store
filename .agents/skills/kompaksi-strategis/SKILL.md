---
name: kompaksi-strategis
description: Panduan pengelolaan jendela konteks dan optimalisasi penghematan token menggunakan proxy CLI RTK serta checkpointing sesi.
---

# Skill: Kompaksi Strategis (Strategic Compaction)

Gunakan skill ini untuk menjaga efisiensi konteks LLM dan meminimalkan konsumsi token selama sesi pengembangan berlangsung.

## Praktik Terbaik Pengelolaan Konteks

### 1. Pemanfaatan RTK CLI Proxy

- Gunakan perintah berbasis RTK untuk menyaring output terminal yang berulang dan boros token:

```bash
rtk gain             # Menampilkan analitik penghematan token
rtk gain --history   # Riwayat eksekusi dan rasio penghematan
rtk git status       # Git status yang diringkas secara cerdas
rtk git diff         # Git diff yang difilter khusus baris relevan
```

- Hindari menjalankan perintah yang membuang output ratusan baris mentah jika hanya beberapa baris yang dibutuhkan.

### 2. Checkpoint & Dokumentasi Berseri

- Catat progres signifikan ke dalam `walkthrough.md` secara berkala.
- Gunakan ringkasan terstruktur daripada menyimpan log percakapan mentah yang panjang.

### 3. Batasi Pencarian File Berlebih

- Gunakan `grep_search` dengan parameter filter `Includes` spesifik (misalnya `*.php` atau `*.css`) alih-alih memindai seluruh folder proyek.
- Hindari membaca file biner atau file aset besar menggunakan pembaca teks.
