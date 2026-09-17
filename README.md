# CRSL Merchandise Store

Re-build website e-commerce merchandise [crsl-store.id](https://crsl-store.id/) dengan tech stack native.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: PHP 8.5 (built-in server)
- **Database**: SQLite 3.50

## Memulai

```bash
# 1. Clone repo
git clone <repo-url>
cd merchandise-store

# 2. Salin environment
copy .env.example .env

# 3. Inisialisasi database
php -r "new SQLite3('data/toko.db');"
sqlite3 data/toko.db < src/basis-data/skema.sql
sqlite3 data/toko.db < src/basis-data/bibit.sql

# 4. Jalankan server development
php -S localhost:8000 -t publik publik/index.php
```

Buka `http://localhost:8000` di browser.

## Struktur Folder

```
├── .agents/          Agentic rules (GEMINI.md)
├── aset/             Aset statis (gambar, ikon SVG, font)
├── publik/           Document root
│   ├── css/          Stylesheet (variabel, dasar, komponen)
│   ├── js/           JavaScript (utilitas, komponen)
│   ├── halaman/      Halaman PHP (beranda, akun)
│   └── index.php     Router
├── src/              Backend logic
│   ├── konfigurasi/  Config PHP
│   ├── basis-data/   SQL schema & seed
│   └── terjemahan/   i18n JSON (id, en)
├── data/             SQLite database
├── DESIGN.md         Design system documentation
└── README.md
```

## Fitur (Fase 1)

- Bilah atas (announcement bar) dengan running text
- Header navigation (hamburger menu, logo, search, account, localization)
- Drawer sidebar navigation
- Search overlay dengan popular tags
- Preferensi lokalisasi (negara, bahasa, mata uang)
- Halaman Akun (login, signup, pesanan, wishlist)
- Dark mode toggle
- i18n (Bahasa Indonesia + English)
- Mobile-first responsive
- Keyboard accessible (WCAG AA)
