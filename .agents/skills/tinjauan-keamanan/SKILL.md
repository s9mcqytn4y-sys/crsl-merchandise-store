---
name: tinjauan-keamanan
description: Prosedur audit keamanan aplikasi CRSL Merchandise Store untuk mencegah injeksi SQL, XSS, manipulasi harga, dan kebocoran basis data.
---

# Skill: Tinjauan Keamanan (Security Review)

Gunakan skill ini sebelum merilis perubahan yang menyentuh endpoint API, formulir masukan, atau logika transaksi pembayaran.

## Daftar Periksa Audit Keamanan

### 1. Audit Query Basis Data
- Cari potensi penggabungan string pada SQL:
  - Periksa seluruh kemunculan `->query("` atau string concatenation di file model/pengelola.
  - Pastikan semua query berparameter menggunakan `prepare()` dan `execute()`.

### 2. Audit Output Template (Anti-XSS)
- Periksa seluruh tag output PHP `<?= $variabel ?>`.
- Pastikan setiap data dinamis dibungkus dengan `htmlspecialchars($variabel, ENT_QUOTES, 'UTF-8')`.

### 3. Audit Validasi Formulir
- Pastikan parameter numerik (seperti `produk_id`, `kuantitas`, `berat`) divalidasi dan di-cast ke tipe angka eksplisit.
- Pastikan input teks disanitasi dari karakter kontrol berbahaya.

### 4. Audit Integritas Transaksi Belanja
- Pastikan harga produk selalu diambil ulang dari tabel `produk` di basis data SQLite pada saat pesanan dibuat di backend.
- Jangan pernah mempercayai parameter harga yang dikirim dari browser atau payload client.
