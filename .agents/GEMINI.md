# CRSL Merchandise Store - Panduan Agen

## Identitas Proyek

- **Nama**: CRSL Merchandise Store
- **Deskripsi**: Re-build website e-commerce merchandise CRSL dengan pendekatan mobile-first
- **Tech Stack**: HTML5, CSS3, Vanilla JS, PHP 8.5, SQLite 3.50
- **Referensi**: [crsl-store.id](https://crsl-store.id/)

## Konvensi Penamaan

| Konteks | Konvensi | Contoh |
| :--- | :--- | :--- |
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

```text
publik/          -> Document root (CSS, JS, halaman PHP)
src/             -> Backend logic (konfigurasi, basis-data, terjemahan)
aset/            -> Aset statis (gambar, ikon SVG, font)
data/            -> SQLite database file
.agents/         -> Konfigurasi agen, rules modular, subagents, dan skills
```

## Arsitektur Agen & Toolkit Modular (.agents/)

Toolkit `everything-claude-code` telah diadaptasi penuh untuk Antigravity / Gemini CLI (`agy`):

1. **Panduan Alur Kerja**: Baca [.agents/WORKFLOWS.md](file:///c:/Projects/merchandise-store/.agents/WORKFLOWS.md) untuk cheatsheet perintah operasional.
2. **Aturan Modular (`.agents/rules/`)**:
   - [keamanan.md](file:///c:/Projects/merchandise-store/.agents/rules/keamanan.md): Standar keamanan SQL injection, XSS, dan proteksi kredensial.
   - [gaya-koding.md](file:///c:/Projects/merchandise-store/.agents/rules/gaya-koding.md): Konvensi penamaan, semantic HTML, dan mobile-first.
   - [pengujian.md](file:///c:/Projects/merchandise-store/.agents/rules/pengujian.md): Siklus TDD dan pengujian CLI.
   - [alur-git.md](file:///c:/Projects/merchandise-store/.agents/rules/alur-git.md): Format commit Bahasa Indonesia dan perubahan atomik.
   - [performa-dan-database.md](file:///c:/Projects/merchandise-store/.agents/rules/performa-dan-database.md): Konkurensi SQLite WAL dan higienitas aset.
   - [delegasi-agen.md](file:///c:/Projects/merchandise-store/.agents/rules/delegasi-agen.md): Pembagian peran dan efisiensi jendela konteks.
3. **Subagen Spesialis (`.agents/agents/`)**:
   - `arsitek`: Perancangan sistem dan skema data.
   - `peninjau-kode`: Audit kualitas, antislop, dan konvensi penamaan.
   - `panduan-tdd`: Pengawalan siklus Red-Green-Refactor.
   - `penyelesai-error`: Debugging presisi dan resolusi runtime exception.
   - `peninjau-keamanan`: Audit celah keamanan OWASP dan integritas transaksi.
   - `pembersih-refaktor`: Eliminasi dead code dan penyederhanaan arsitektur.
4. **Skills Alur Kerja (`.agents/skills/`)**:
   - `alur-tdd`: Alur implementasi uji mandiri di `scratch/`.
   - `siklus-verifikasi`: Loop verifikasi otomatis sebelum rilis.
   - `tinjauan-keamanan`: Checklist audit endpoint dan SQL.
   - `kompaksi-strategis`: Optimasi token konteks bersama RTK CLI.

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

Mode Operasi Aktif: **Mode 1 (DURING pengerjaan)**
Dials: **ENERGY 2 / RHYTHM 2 / MOTION 2**
Untuk UI, copy, people, mobile layout, atau code comments, baca `antislop.md` (core) dan skill yang relevan:

- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`

## Standar Keandalan Sistem & Database (/007)

1. **SQLite Concurrency**: Selalu aktifkan `PRAGMA journal_mode = WAL;`, `PRAGMA synchronous = NORMAL;`, dan `PRAGMA busy_timeout = 5000;` pada koneksi PDO.
2. **Memory Leaks**: Panggil `PengelolaDatabase::tutupKoneksi()` pada script CLI atau saat akhir lifecycle permintaan berat.
3. **Asset & SEO Hygiene**: Semua aset wajib WebP/SVG lokal dengan penamaan kebab-case deskriptif, atribut `alt`, `width`, dan `height`. Tidak boleh ada dead assets (404).
4. **CSS Compatibility Baseline**: Bungkus properti scrollbar modern dalam `@supports (scrollbar-width: ...)` dan pastikan tidak ada vendor-prefix yatim tanpa padanan standar.
<!-- antislop:end -->
