# Panduan Alur Kerja Agen & Pengembang (Workflows Guide)

Dokumen ini adalah ringkasan panduan operasional cepat untuk menjalankan alur kerja otomatis di proyek **CRSL Merchandise Store** menggunakan **Antigravity / Gemini CLI (`agy`)** dan **RTK**.

---

## 🗺️ Peta Komparasi: Claude Code vs Antigravity / Gemini

| Konsep Claude Code | Padanan di Proyek Ini (Antigravity/Gemini) | Lokasi Berkas / Konfigurasi |
|:---|:---|:---|
| `CLAUDE.md` / `user-CLAUDE.md` | `GEMINI.md` / `AGENTS.md` | `.agents/GEMINI.md` |
| `~/.claude/rules/*.md` | Aturan Modular Workspace | `.agents/rules/*.md` |
| `~/.claude/agents/*.md` | Subagen Spesialis Antigravity | `.agents/agents/*.md` |
| `~/.claude/skills/*` | Antigravity Skills | `.agents/skills/*/SKILL.md` |
| `/tdd` Command | Skill Alur TDD | `.agents/skills/alur-tdd/SKILL.md` |
| `/verify` Command | Skill Siklus Verifikasi | `.agents/skills/siklus-verifikasi/SKILL.md` |
| `/code-review` Command | Subagen Peninjau Kode | `.agents/agents/peninjau-kode.md` |
| `/build-fix` Command | Subagen Penyelesai Error | `.agents/agents/penyelesai-error.md` |
| `/security-review` Command | Subagen & Skill Keamanan | `.agents/agents/peninjau-keamanan.md` |
| `Context Window Compression` | Strategic Compaction & RTK | `.agents/skills/kompaksi-strategis/SKILL.md` |

---

## ⚡ Alur Kerja Utama (Core Workflows)

### 1. Alur Kerja Fitur Baru & Perbaikan (TDD Workflow)
Gunakan saat menambah fitur transaksi, diskon, atau modul data:
1. Buat skrip pengujian mandiri di `scratch/uji_<fitur>.php`.
2. Jalankan pengujian dan pastikan gagal pada kondisi awal (Fase RED).
3. Buat implementasi minimal pada `src/` atau `publik/` (Fase GREEN).
4. Rapikan kode dengan konvensi penamaan Bahasa Indonesia (Fase REFACTOR).

### 2. Siklus Verifikasi Cepat (Quick Verification Loop)
Jalankan urutan perintah berikut sebelum commit:
```bash
# 1. Periksa sintaksis PHP
php -l publik/index.php
php -l publik/halaman/*.php

# 2. Uji respons server lokal
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/products
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/akun

# 3. Pastikan nol em dash
rg "—" publik/ src/ .agents/

# 4. Cek status git
git status -s
```

### 3. Tinjauan Keamanan & Integritas Transaksi
Sebelum merilis modul checkout atau pembayaran:
- Pastikan kalkulasi total belanja selalu dihitung ulang di backend dari tabel `produk`.
- Pastikan seluruh parameter input formulir melalui casting tipe data atau validasi ketat.
- Pastikan seluruh output data dinamis di HTML dibungkus `htmlspecialchars()`.

### 4. Efisiensi Token Terminal dengan RTK
Selalu gunakan utilitas RTK untuk perintah terminal berulang:
- `rtk gain`: Menampilkan total token yang berhasil dihemat.
- `rtk proxy <cmd>`: Jalankan perintah mentah saat membutuhkan debugging khusus.
