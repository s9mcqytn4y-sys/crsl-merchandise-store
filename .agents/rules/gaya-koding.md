# Aturan Gaya Koding (Coding Style Rules) - CRSL Merchandise Store

Panduan ini mengatur standar arsitektur, konvensi penamaan, dan kebersihan kode untuk proyek CRSL Merchandise Store.

## 1. Konvensi Penamaan

| Konteks | Konvensi | Contoh |
|:---|:---|:---|
| Berkas & Folder | `snake_case` | `bilah_atas.css`, `menu_samping.js` |
| CSS Class | `kebab-case` | `.bilah-atas`, `.kartu-produk__judul` |
| CSS Custom Property | `kebab-case` | `--warna-primer`, `--radius-md` |
| JS Variabel & Fungsi | `camelCase` | `bukaMenu()`, `ambilDataKeranjang()` |
| PHP Class | `PascalCase` | `PengelolaDatabase`, `PengelolaPesanan` |
| PHP Method & Variabel | `camelCase` | `ambilSemua()`, `$daftarProduk` |
| Database Table & Kolom | `snake_case` | `daftar_produk`, `status_pesanan` |
| I18n Translation Key | `dot.notation` | `navigasi.beranda`, `pesanan.sukses` |

## 2. Bahasa Kode & Komentar
- **Bahasa Indonesia**: Digunakan untuk domain bisnis, nama variabel bisnis, nama fungsi bisnis, komentar penjelasan alur sistem, dan pesan commit git.
- **English**: Digunakan untuk istilah teknis umum (misal: `request`, `response`, `payload`, `render`, `query`, `cookie`, `session`).

## 3. Prinsip Kesederhanaan & Zero External Frameworks
- **Tanpa Framework CSS/JS**: Jangan gunakan Tailwind CSS, Bootstrap, React, Vue, atau library eksternal lainnya kecuali font resmi dari Google Fonts.
- **Semantic HTML**: Gunakan tag semantik standar (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) alih-alih penumpukan tag `<div>`.
- **Aksesibilitas (a11y)**:
  - Rasio kontras teks minimum 4.5:1 untuk teks normal.
  - Setiap elemen interaktif (tombol, input, tautan) wajib memiliki label yang jelas (`aria-label` jika hanya berupa ikon).
  - Navigasi keyboard penuh (`Tab`, `Enter`, `Escape` untuk menutup modal/drawer).

## 4. Pendekatan Mobile-First
- Tulis CSS untuk layar ponsel terlebih dahulu (default layout tanpa media query).
- Gunakan `@media (min-width: ...)` untuk mengatur tampilan tablet dan desktop.
- Pastikan tidak ada horizontal scrollbar yang tidak disengaja (`overflow-x: hidden` pada container utama atau padding yang terkontrol).
- Ukuran touch target minimum 44px x 44px untuk elemen yang dapat ditekan pada perangkat sentuh.

## 5. Antislop Quality Standards
- **Dilarang keras menggunakan tanda baca em dash (`—`)**. Gunakan tanda hubung biasa (`-`) atau titik dua (`:`).
- Tidak boleh ada dead links (`href="#"` tanpa handler) atau dead buttons.
- Setiap operasi asinkron wajib memiliki indikator loading, state kosong (empty state), dan penanganan error yang jelas.
- Hindari komentar basa-basi AI seperti `// This function returns the total` atau `// Initialize variables`. Tulis komentar hanya untuk konteks keputusan desain non-sepele atau edge cases.
