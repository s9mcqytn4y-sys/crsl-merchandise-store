# CRSL Merchandise Store - Panduan Agen

## Identitas Proyek
- **Nama**: CRSL Merchandise Store
- **Deskripsi**: Re-build website e-commerce merchandise CRSL dengan pendekatan mobile-first
- **Tech Stack**: HTML5, CSS3, Vanilla JS, PHP 8.5, SQLite 3.50
- **Referensi**: https://crsl-store.id/

## Konvensi Penamaan

| Konteks | Konvensi | Contoh |
|:---|:---|:---|
| File & folder | snake_case | `bilah_atas.css`, `menu_samping.js` |
| CSS class | kebab-case | `.bilah-atas`, `.menu-samping__item` |
| CSS custom property | kebab-case | `--warna-primer`, `--jarak-sm` |
| JS variable & function | camelCase | `bukaMenu()`, `teksPromo` |
| PHP class | PascalCase | `PengelolaDatabase`, `PengaturRute` |
| PHP method & variable | camelCase | `$daftarProduk`, `ambilSemua()` |
| Database table & column | snake_case | `daftar_produk`, `nama_lengkap` |
| i18n key | dot notation | `navigasi.beranda`, `akun.masuk` |

## Bahasa
- Kode (nama variabel, komentar): **Bahasa Indonesia** untuk domain/bisnis, English untuk technical terms
- UI text: **Bahasa Indonesia** sebagai primary, English secondary (i18n)
- Commit message: **Bahasa Indonesia**

## Struktur Folder
```
publik/          -> Document root (CSS, JS, halaman PHP)
src/             -> Backend logic (konfigurasi, basis-data, terjemahan)
aset/            -> Aset statis (gambar, ikon SVG, font)
data/            -> SQLite database file
```

## Aturan Pengembangan

1. **Jangan over-engineering.** Solusi paling sederhana yang bekerja.
2. **Mobile-first.** Tulis CSS untuk mobile dulu, `@media (min-width)` untuk desktop.
3. **Semantic HTML.** Gunakan `<nav>`, `<header>`, `<main>`, `<section>`, `<article>`, bukan div spam.
4. **Aksesibilitas.** Semua interactive element harus keyboard-accessible, ARIA labels lengkap, contrast ratio >= 4.5:1.
5. **Tidak ada dependensi eksternal** kecuali Google Fonts. Tidak ada framework CSS/JS.
6. **Iterasi bertahap.** Satu komponen selesai, test, baru lanjut.
7. **Semua button/link harus fungsional** atau dihapus. Tidak ada dead controls.

## Antislop Checklist
Sebelum deliver UI, pastikan:
- [ ] Tidak ada em dash di text
- [ ] Mobile responsive tanpa horizontal overflow
- [ ] Semua nav item punya destinasi real
- [ ] Contrast ratio >= 4.5:1 untuk normal text
- [ ] Semua button/link fungsional
- [ ] Ada empty/loading/error state
- [ ] Keyboard navigable (Tab, Enter, Escape)
- [ ] Tidak ada fabricated data (testimonial palsu, statistik palsu)
- [ ] App sudah di-run dan ditest sebelum deliver

<!-- antislop:start -->
## antislop
Untuk UI, copy, people, mobile layout, atau code comments, baca `antislop.md` (core) dan skill yang relevan:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Sebelum mulai, tanya user kapan antislop diterapkan: saat pengerjaan, atau setelah selesai.
<!-- antislop:end -->
