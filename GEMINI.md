# CRSL Store v2 — Guidelines & Architecture Specification

## 1. Ekosistem & Stack Teknologi (Laravel 13.x + Inertia React 19)

### Backend Ecosystem (Laravel 13.x)
- **Framework**: Laravel 13.x (`laravel/framework` ^13.17) pada PHP 8.3+ / PHP 8.5
- **Single Page Application Bridge**: Inertia.js Laravel (`inertiajs/inertia-laravel` ^3.3)
- **Primary Database**: PostgreSQL 16+ (`crsl_store_v2` di `127.0.0.1:5432`) dengan driver `pdo_pgsql`
- **Cache & Session Engine**: Dedicated SQLite3 database (`database/cache.sqlite`) melalui koneksi `cache_sqlite`
- **Integrasi Kurir & Ekspedisi**: Biteship API Driver (`PengelolaBiteship.php`)
- **Integrasi Payment Gateway**: Midtrans Core API Direct Charge (`PengelolaMidtrans.php`)

### Frontend Ecosystem (React 19 + TypeScript 7)
- **UI Engine**: React 19 (`react` ^19.3.0) + `@inertiajs/react` (^3.7.1)
- **Language**: TypeScript 7 (`typescript` ^7.0.2) dengan Strict Mode
- **Styling**: Tailwind CSS v4 (`tailwindcss` ^4.3.3) + `@tailwindcss/vite`
- **Utility CSS Helpers**: `clsx` (^2.1.1) + `tailwind-merge` (^3.7.0)
- **Ikonografi**: Lucide React (`lucide-react` ^1.47.0)
- **State Management**: Zustand v5 (`zustand` ^5.0.15) — `useKeranjangStore.ts`
- **Micro-Animations**: GSAP 3 (`gsap` ^3.15.0) untuk transisi halaman, keranjang belanja, dan mikro-interaksi UI
- **Build Tool**: Vite 8 (`vite` ^8.0.0) + `laravel-vite-plugin` (^3.1)

---

## 2. Standardisasi Domain & Naming Convention (Bahasa Indonesia)

Seluruh entitas database, Model Eloquent, Controller, Rute Web, dan kontrak API secara ketat menggunakan penamaan domain **Bahasa Indonesia**:

### 17 Model Eloquent & Tabel PostgreSQL
1. `Kategori` (`kategori`) — Kategori produk merchandise (T-Shirt, Outerwear, Accessories, Toys, etc.)
2. `Produk` (`produk`) — Katalog produk utama beserta slug, deskripsi, dan status aktif
3. `ProdukVarian` (`produk_varian`) — Varian ukuran (S, M, L, XL) dan warna beserta stok dan SKU
4. `ProdukSpesifikasi` (`produk_spesifikasi`) — Detail spesifikasi teknis dan bahan produk
5. `GambarProduk` (`gambar_produk`) — Foto produk WebP lokal (`/assets/gambar/`) dan status gambar utama
6. `TierLoyalitas` (`tier_loyalitas`) — Tingkatan poin dan benefit keanggotaan pelanggan
7. `PenggunaLoyalitas` (`pengguna_loyalitas`) — Saldo poin dan histori tier pelanggan
8. `Voucher` (`voucher`) — Kode promo diskon nominal/persentase dan minimal belanja
9. `VoucherTerpakai` (`voucher_terpakai`) — Log klaim voucher oleh pelanggan
10. `WilayahIndonesia` (`wilayah_indonesia`) — Master data provinsi, kota/kabupaten, dan kecamatan
11. `AlamatPengguna` (`alamat_pengguna`) — Daftar alamat pengiriman pelanggan
12. `Pesanan` (`pesanan`) — Header transaksi pesanan dan nomor invoice unik (`CRSL-YYYYMMDD-XXXX`)
13. `ItemPesanan` (`item_pesanan`) — Rincian item produk, kuantitas, dan harga saat dipesan
14. `PesananPengiriman` (`pesanan_pengiriman`) — Detail kurir, resi pengiriman, dan status Biteship
15. `PesananPembayaran` (`pesanan_pembayaran`) — Method pembayaran Midtrans, snap token, dan status bayar
16. `Wishlist` (`wishlist`) — Daftar produk favorit pelanggan
17. `PesanProduk` (`pesan_produk`) — Diskusi atau pesan pertanyaan produk dari pelanggan

### 6 Controller Utama
- `BerandaController`: Halaman utama, produk unggulan, banner promo
- `KatalogController`: Listing produk, filter kategori, pencarian, dan detail produk
- `KeranjangController`: Manajemen keranjang belanja berbasis session & state
- `PembayaranController`: Form checkout, kalkulasi ongkir Biteship, dan trigger payment Midtrans
- `PesananController`: Halaman faktur/invoice dan lacak status pesanan
- `AkunController`: Profil pelanggan, alamat pengiriman, dan daftar wishlist

---

## 3. Pola Desain (Design Patterns) & Arsitektur

1. **Modular Monolith Architecture**: Pemisahan domain bisnis yang jelas di dalam struktur standar Laravel tanpa beban infrastruktur microservices.
2. **Repository/Service Gateway Driver**: Wrapper terisolasi untuk layanan pihak ketiga (Midtrans Direct Charge & Biteship Shipping API).
3. **Hybrid State Management**:
   - **Client State**: Zustand (`useKeranjangStore.ts`) untuk kalkulasi real-time jumlah item, drawer state, dan persistensi keranjang lokal.
   - **Server State**: Inertia.js Page Props untuk data katalog, detail produk, invoice, dan profil akun.
4. **GSAP 3 Micro-Animations Pattern**:
   - Animasi kemunculan kartu produk (`gsap.fromTo`).
   - Drawer keranjang belanja (*slide-in* & *backdrop fade*).
   - Indikator badge keranjang membal (*bounce scale*) saat item ditambahkan.

---

## 4. Standar UI/UX, Aksesibilitas & Antislop

- **Mobile-First Responsive Design**: Tata letak diutamakan untuk layar seluler terlebih dahulu, disesuaikan dengan breakpoint Tailwind v4 (`sm`, `md`, `lg`, `xl`).
- **Aksesibilitas (a11y)**: Rasio kontras teks minimum 4.5:1, dukungan navigasi keyboard penuh (`Tab`, `Enter`, `Escape`), dan atribut `aria-label` pada elemen interaktif.
- **Antislop Quality Rules**:
  - Dilarang keras menggunakan em dash (`—`). Gunakan tanda hubung biasa (`-`).
  - Tidak ada *horizontal overflow* tak disengaja pada perangkat seluler.
  - Setiap tombol & tautan wajib memiliki destinasi real dan *hover/active states*.
