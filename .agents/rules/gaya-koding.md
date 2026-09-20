# Aturan Gaya Koding (Coding Style Rules) — CRSL Store v2

Panduan ini mengatur standar arsitektur, konvensi penamaan, dan kebersihan kode untuk proyek CRSL Store v2 berbasis **Laravel 13.x + Inertia.js (React 19 + TypeScript) + Tailwind CSS v4**.

## 1. Konvensi Penamaan (Domain Bahasa Indonesia)

| Konteks | Konvensi | Contoh |
|:---|:---|:---|
| Berkas Backend (PHP) | `PascalCase` | `BerandaController.php`, `ProdukVarian.php` |
| Berkas Frontend (React Component) | `PascalCase` | `MainLayout.jsx`, `Catalog.jsx` |
| Berkas Utility & Custom Hooks | `camelCase` | `useKeranjangStore.ts`, `formatRupiah.ts` |
| CSS Class | Utility Class Tailwind v4 | `flex flex-col gap-4 text-slate-800` |
| JS/TS Variabel & Fungsi | `camelCase` | `tambahKeranjang()`, `prosesPembayaran()` |
| PHP Method & Variabel | `camelCase` | `ambilSemua()`, `$daftarProduk` |
| Database Table & Kolom | `snake_case` (Bahasa Indonesia) | `kategori`, `produk`, `nomor_pesanan` |

## 2. Bahasa Kode & Komentar
- **Bahasa Indonesia**: Digunakan untuk entitas domain bisnis, Model Eloquent, Controller, nama variabel bisnis, komentar alur sistem, dan pesan commit git.
- **English**: Digunakan untuk istilah teknis bawaan framework (misal: `request`, `response`, `props`, `state`, `payload`, `migration`, `render`).

## 3. Komponen React 19 & TypeScript Strict Mode
- Gunakan React 19 Functional Components dengan Type Definitions yang ketat di TypeScript (`.ts`/`.tsx`).
- Selalu sediakan fallback data pada komponen React Inertia untuk mengantisipasi `props` kosong atau undefined.
- Komponen wajib bersifat modular, dapat digunakan kembali (reusable), dan mematuhi aturan komponen kustom.

## 4. Tailwind CSS v4 & Aksesibilitas (a11y)
- Gunakan Tailwind CSS v4 `@tailwindcss/vite` untuk tata letak dan penataan gaya.
- **Pendekatan Mobile-First**: Tuliskan utility class untuk mobile terlebih dahulu, dan manfaatkan modifier breakpoint (`sm:`, `md:`, `lg:`, `xl:`) untuk desktop.
- **Aksesibilitas**:
  - Rasio kontras teks minimum 4.5:1.
  - Setiap elemen interaktif (tombol, input, tautan) wajib memiliki `aria-label` yang jelas jika berupa ikon.
  - Navigasi keyboard penuh (`Tab`, `Enter`, `Escape` untuk menutup modal/drawer).

## 5. Antislop Quality Standards
- **Dilarang keras menggunakan tanda baca em dash (`—`)**. Gunakan tanda hubung biasa (`-`) atau titik dua (`:`).
- Tidak boleh ada dead links (`href="#"` tanpa handler) atau dead buttons.
- Setiap operasi asinkron wajib memiliki indikator loading, state kosong (*empty state*), dan penanganan error yang jelas.
- Hindari komentar basa-basi AI seperti `// This function returns the total`. Tulis komentar hanya untuk konteks keputusan desain non-sepele atau edge cases.
