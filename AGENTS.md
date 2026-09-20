# CRSL Store v2 — Agent Guidelines

This repository contains **CRSL Store v2**, built with **Laravel 13.x**, **Inertia.js (React 19 + TypeScript)**, **Tailwind CSS v4**, **PostgreSQL 16+**, **SQLite Cache**, **Zustand v5**, and **GSAP 3**.

## Prerequisites & Verification

```powershell
php -v
composer -V
npm -v
```

Ensure `pdo_pgsql` and `pdo_sqlite` extensions are enabled in PHP INI.

## Development Commands

```powershell
# Run database migrations and seeders on PostgreSQL
php artisan migrate:fresh --seed

# Run SQLite cache database migrations
php artisan migrate --database=cache_sqlite

# Compile frontend production bundle
npm run build

# Start Vite dev server
npm run dev

# Run Laravel test suite
php artisan test
```

## Architecture & Code Standards
- **Standardized Domain Conventions (Bahasa Indonesia)**: All 17 Eloquent models (`Kategori`, `Produk`, `ProdukVarian`, `ProdukSpesifikasi`, `GambarProduk`, `Pesanan`, `ItemPesanan`, `PesananPengiriman`, `PesananPembayaran`, `AlamatPengguna`, `WilayahIndonesia`, `TierLoyalitas`, `PenggunaLoyalitas`, `Voucher`, `VoucherTerpakai`, `Wishlist`, `PesanProduk`), controllers (`BerandaController`, `KatalogController`, `KeranjangController`, `PembayaranController`, `PesananController`, `AkunController`), migration tables, columns, and API contracts use Indonesian domain terms.
- **State Management**: Client-side state managed via Zustand (`resources/js/Stores/useKeranjangStore.ts`).
- **Animations**: Page & component micro-animations powered by GSAP 3 (`gsap`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with mobile-first responsive design.
