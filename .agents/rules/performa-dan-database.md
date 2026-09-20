# Aturan Performa & Basis Data (Performance & Database Rules) — CRSL Store v2

Aturan keandalan sistem backend, pengelolaan PostgreSQL 16+, caching SQLite, Zustand state management, dan animasi GSAP 3.

## 1. Primary Database (PostgreSQL 16+)
- **Koneksi**: `crsl_store_v2` pada `127.0.0.1:5432` menggunakan PDO driver `pdo_pgsql`.
- **Integritas Referensial**: Setiap tabel wajib memiliki *Primary Key*, *Foreign Key constraints* dengan `onDelete('cascade')` atau `onDelete('restrict')`, serta indeks pada kolom yang sering dicari (`slug`, `nomor_pesanan`, `status`, `sku`).
- **Standardisasi Penamaan**: Seluruh 17 tabel menggunakan Bahasa Indonesia (`kategori`, `produk`, `produk_varian`, `produk_spesifikasi`, `gambar_produk`, `tier_loyalitas`, `pengguna_loyalitas`, `voucher`, `voucher_terpakai`, `wilayah_indonesia`, `alamat_pengguna`, `pesanan`, `item_pesanan`, `pesanan_pengiriman`, `pesanan_pembayaran`, `wishlist`, `pesan_produk`).

## 2. Dedicated SQLite Cache & Session Database
- **Driver**: SQLite3 isolated pada `database/cache.sqlite` melalui koneksi `cache_sqlite` untuk menyimpan data sesi pengguna dan cache query Laravel.
- **Konkurensi**: SQLite dikonfigurasi dengan mode WAL untuk efisiensi sesi I/O.

## 3. Zustand v5 State Management Pattern
- Store utama keranjang belanja dikelola melalui `resources/js/Stores/useKeranjangStore.ts`.
- Digunakan untuk kalkulasi kuantitas item, subtotal real-time, status drawer keranjang, dan sinkronisasi data lokal.

## 4. GSAP 3 Micro-Animations
- Gunakan GSAP 3 (`gsap`) untuk animasi mikro UI yang halus tanpa membebani thread utama browser:
  - *Fade-in & Y-slide* saat render daftar produk atau halaman baru.
  - *Bounce scale* pada badge keranjang saat item ditambahkan.
  - *Slide & Fade* pada keranjang belanja drawer.
- Selalu bersihkan (*kill/cleanup*) GSAP context atau timeline dalam `useEffect` unmount hook jika digunakan pada React.

## 5. Higienitas Aset & Optimasi Frontend
- **Format Aset**: Foto produk disimpan dalam format WebP di `public/assets/gambar/` dan ikon dalam format SVG di `public/assets/ikon/`.
- **Dimensi & SEO**: Setiap tag `<img>` wajib memiliki atribut `alt` deskriptif serta atribut `width` dan `height` eksplisit untuk mencegah Cumulative Layout Shift (CLS).
- **Zero Dead Assets**: Jangan ada pemanggilan file gambar atau ikon yang menghasilkan status 404.
