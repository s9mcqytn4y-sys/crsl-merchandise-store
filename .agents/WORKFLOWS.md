# Panduan Alur Kerja Agen & Pengembang (Workflows Guide) — CRSL Store v2

Dokumen ini adalah ringkasan panduan operasional cepat untuk menjalankan alur kerja otomatis di proyek **CRSL Store v2** menggunakan **Antigravity / Gemini CLI (`agy`)** dan **RTK**.

---

## ⚡ Alur Kerja Utama (Core Workflows)

### 1. Siklus Verifikasi Cepat (Quick Verification Loop)

Jalankan urutan perintah berikut sebelum commit:

```powershell
# 1. Jalankan migrasi & seeding PostgreSQL
php artisan migrate:fresh --seed

# 2. Jalankan migrasi SQLite cache database
php artisan migrate --database=cache_sqlite

# 3. Jalankan test suite Laravel
php artisan test

# 4. Uji kompilasi frontend
npm run build

# 5. Periksa status git
git status -s
```

### 2. Tinjauan Keamanan & Integritas Transaksi

Sebelum merilis modul checkout atau pembayaran:

- Pastikan kalkulasi total belanja selalu dihitung ulang di backend dari tabel `produk` & `produk_varian`.
- Verifikasi signature notification webhook dari Midtrans sebelum memperbarui status `pesanan_pembayaran`.
- Pastikan API Key Biteship dan Midtrans disimpan secara aman di `.env`.

### 3. Efisiensi Token Terminal dengan RTK

Selalu gunakan utilitas RTK untuk perintah terminal berulang:

- `rtk gain`: Menampilkan total token yang berhasil dihemat.
- `rtk proxy <cmd>`: Jalankan perintah mentah saat membutuhkan debugging khusus.
