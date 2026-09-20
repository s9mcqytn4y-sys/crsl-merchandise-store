# CRSL Store v2 — E-Commerce Merchandise Store

CRSL Store v2 adalah aplikasi e-commerce merchandise resmi CRSL yang dibangun dengan arsitektur **Modular Monolith** menggunakan **Laravel 13.x**, **Inertia.js (React 19 + TypeScript)**, **Tailwind CSS v4**, **PostgreSQL 16+**, **SQLite Cache**, **Zustand v5**, dan **GSAP 3**.

---

## Stack Teknologi & Arsitektur

### Backend & Database
- **Framework**: Laravel 13.x (`laravel/framework` ^13.17)
- **PHP**: PHP 8.3+ / PHP 8.5
- **Primary Database**: PostgreSQL 16+ (`crsl_store_v2` pada `127.0.0.1:5432`)
- **Cache & Sessions**: Dedicated SQLite3 database (`database/cache.sqlite`)
- **Integrasi Pihak Ketiga**: Biteship Maps & Rates API (`PengelolaBiteship.php`), Midtrans Core API Direct Charge (`PengelolaMidtrans.php`)

### Frontend & UI/UX
- **SPA Bridge**: Inertia.js Laravel (^3.3) & `@inertiajs/react` (^3.7)
- **UI Framework**: React 19 (`react` ^19.3) + TypeScript 7 Strict Mode
- **CSS Framework**: Tailwind CSS v4 (`@tailwindcss/vite` ^4.3)
- **State Management**: Zustand v5 (`useKeranjangStore.ts`)
- **Micro-Animations**: GSAP 3 (`gsap` ^3.15)
- **Icons & Helpers**: Lucide React, `clsx`, `tailwind-merge`

---

## Konvensi Penamaan Bahasa Indonesia

Seluruh entitas basis data, Model Eloquent, Controller, dan Rute Web mengadopsi domain penamaan Bahasa Indonesia:
- **17 Eloquent Models**: `Kategori`, `Produk`, `ProdukVarian`, `ProdukSpesifikasi`, `GambarProduk`, `TierLoyalitas`, `PenggunaLoyalitas`, `Voucher`, `VoucherTerpakai`, `WilayahIndonesia`, `AlamatPengguna`, `Pesanan`, `ItemPesanan`, `PesananPengiriman`, `PesananPembayaran`, `Wishlist`, `PesanProduk`
- **6 Controller**: `BerandaController`, `KatalogController`, `KeranjangController`, `PembayaranController`, `PesananController`, `AkunController`

---

## Panduan Instalasi & Jalankan Sistem

```powershell
# 1. Install dependensi Composer & NPM
composer install
npm install

# 2. Salin environment file & generate key
copy .env.example .env
php artisan key:generate

# 3. Migrasi & Seeding Database PostgreSQL
php artisan migrate:fresh --seed

# 4. Migrasi Database Cache SQLite
php artisan migrate --database=cache_sqlite

# 5. Build Aset Frontend Produksi
npm run build

# 6. Jalankan Server Dev (Vite & Laravel)
npm run dev
```
