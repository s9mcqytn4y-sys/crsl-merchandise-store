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
- **Standardized Domain Conventions (Bahasa Indonesia)**: All 19 Eloquent models, controllers (`BerandaController`, `KatalogController`, `KeranjangController`, `PembayaranController`, `PesananController`, `AkunController`), migration tables, and domain layer in `app/Domains/` (`Autentikasi`, `Inventori`, `Keranjang`, `Pembayaran`, `Pengiriman`, `Pesanan`) strictly follow standardized Indonesian terminology.
- **Session & Cookie Architecture**: PostgreSQL database session driver with 120m lifetime. Unencrypted cookies for client preferences (`crsl_user_preferences`, `crsl_locale`, `crsl_currency`).
- **State Management**: Client-side state managed via Zustand (`resources/js/Stores/useKeranjangStore.ts`).
- **Animations**: Page & component micro-animations powered by GSAP 3 (`gsap`) with strict context cleanup.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with mobile-first responsive design, semantic design tokens, and anti-slop guidelines (no em dash, no harsh arbitrary corners).
