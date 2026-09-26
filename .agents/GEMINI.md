# CRSL Store v2 — Guidelines & Architecture Specification

## 1. Ekosistem & Stack Teknologi (Laravel 13.x + Inertia React 19)

### Backend Ecosystem (Laravel 13.x)
- **Framework**: Laravel 13.x (`laravel/framework` ^13.17) pada PHP 8.3+ / PHP 8.5
- **Autentikasi & Token**: Laravel Sanctum (`laravel/sanctum` ^4.3)
- **Single Page Application Bridge**: Inertia.js Laravel (`inertiajs/inertia-laravel` ^3.3) & Ziggy (`tightenco/ziggy` ^2.6)
- **Primary Database**: PostgreSQL 16+ (`crsl_store_v2` di `127.0.0.1:5432`) dengan driver `pdo_pgsql`
- **Cache & Session Engine**: Dedicated SQLite3 database (`database/cache.sqlite`) melalui koneksi `cache_sqlite`
- **Domain Layer (`app/Domains/`)**:
  - `Autentikasi`: `AuthService.php`, `OtpService.php`, `RegistrasiPenggunaAction.php`, `VerifikasiOtpAction.php` — Flow verifikasi OTP 6 digit & soft delete `hapusAkun`.
  - `Pesanan`: `BuatPesananAction.php`, `PesananService.php` — Penomoran `INV/CRSL/YYYYMMDD/XXXX` dengan daily locking counter dan cross-table max-order protection.
  - `Inventori`: `InventoriService.php` — Proteksi transaksi `lockForUpdate()` pada stok varian produk.
  - `Keranjang`: `KeranjangService.php` — Persistensi keranjang database (`keranjang`, `item_keranjang`) & Zustand.
  - `Pengiriman`: `BiteshipService.php` — Area search, rates calculation, order allocation dengan dukungan Dropshipper (`is_dropship`).
  - `Pembayaran`: `MidtransService.php` — Direct Charge Core API (`/v2/charge`) untuk QRIS & Bank VA.
- **Webhook Tunnel Command**: `cloudflared tunnel --url http://localhost:8000`

### Frontend Ecosystem (React 19 + TypeScript 7)
- **UI Engine**: React 19 (`react` ^19.3.0) + `@inertiajs/react` (^3.7.1)
- **UI Primitives**: Headless UI (`@headlessui/react` ^2.2) & Heroicons (`@heroicons/react` ^2.2)
- **Language**: TypeScript 7 (`typescript` ^7.0.2) dengan Strict Mode
- **Styling**: Tailwind CSS v4 (`tailwindcss` ^4.3.3) + `@tailwindcss/vite`
- **Form & Validasi**: React Hook Form (`react-hook-form` ^7.54) + Zod (`zod` ^3.24) + `@hookform/resolvers`
- **Notifikasi Toast**: Sonner (`sonner` ^2.0)
- **Komponen Transisi**: `BilahAtas.tsx`, `HeroCarousel.tsx` (GSAP 3 Parallax)
- **Utility CSS Helpers**: `clsx` (^2.1.1) + `tailwind-merge` (^3.7.0)
- **Ikonografi**: Lucide React (`lucide-react` ^1.47.0)
- **State Management**: Zustand v5 (`zustand` ^5.0.15) — `useKeranjangStore.ts`
- **Micro-Animations**: GSAP 3 (`gsap` ^3.15.0) untuk transisi halaman, keranjang belanja, dan mikro-interaksi UI
- **Build Tool**: Vite 8 (`vite` ^8.0.0) + `laravel-vite-plugin` (^3.1) (`chunkSizeWarningLimit: 1000`)

---

## 2. Standardisasi Domain & Naming Convention (Bahasa Indonesia)

Seluruh entitas database, Model Eloquent, Controller, Rute Web, dan kontrak API secara ketat menggunakan penamaan domain **Bahasa Indonesia**:

### 19 Model Eloquent & Tabel PostgreSQL
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
12. `Pesanan` (`pesanan`) — Header transaksi pesanan dan nomor invoice unik (`INV/CRSL/YYYYMMDD/XXXX`)
13. `ItemPesanan` (`item_pesanan`) — Rincian item produk, kuantitas, dan harga saat dipesan
14. `PesananPengiriman` (`pesanan_pengiriman`) — Detail kurir, resi pengiriman, dan status Biteship
15. `PesananPembayaran` (`pesanan_pembayaran`) — Method pembayaran Midtrans, snap token, dan status bayar
16. `Wishlist` (`wishlist`) — Daftar produk favorit pelanggan
17. `PesanProduk` (`pesan_produk`) — Diskusi atau pesan pertanyaan produk dari pelanggan
18. `Keranjang` (`keranjang`) — Header keranjang pengguna terautentikasi / session
19. `ItemKeranjang` (`item_keranjang`) — Item produk & varian terikat keranjang pengguna

---

## 3. Pola Desain (Design Patterns) & Arsitektur

1. **Modular Monolith Architecture**: Pemisahan domain bisnis yang jelas di dalam struktur `app/Domains/` tanpa beban arsitektur microservices.
2. **Katalog & Discovery (Iteration 2)**:
   - PLP (`Catalog.jsx`): Dual-handle price slider, color swatch & size filters, sort dropdown, active filter chips.
   - PDP (`ProductDetail.jsx`): Variant swatches, image gallery zoom, Biteship delivery cost estimator, "Message CRSL?" inquiry modal, "You Might Also Like" & "Recent Viewed" carousels.
   - Live Search (`PencarianModal.tsx`): Debounced search autocomplete dengan LocalStorage search history & zero-result best seller fallback.
3. **Delete Account Rules**:
   - Modal konfirmasi penghapusan akun wajib mengetikkan kata "DELETE" (case-sensitive) secara presisi.
   - Sistem memblokir penghapusan akun jika user masih memiliki pesanan aktif (`belum_bayar`, `akan_dikirim`, `dikirim`).

---

## 4. Standar UI/UX, Aksesibilitas & Antislop

- **Mobile-First Responsive Design**: Tata letak diutamakan untuk layar seluler terlebih dahulu, disesuaikan dengan breakpoint Tailwind v4 (`sm`, `md`, `lg`, `xl`).
- **Aksesibilitas (a11y)**: Rasio kontras teks minimum 4.5:1, dukungan navigasi keyboard penuh (`Tab`, `Enter`, `Escape`), dan atribut `aria-label` pada elemen interaktif.
- **Antislop Quality Rules**:
  - Dilarang keras menggunakan em dash (`—`). Gunakan tanda hubung biasa (`-`).
  - Tidak ada *horizontal overflow* tak disengaja pada perangkat seluler.
  - Setiap tombol & tautan wajib memiliki destinasi real dan *hover/active states*.
