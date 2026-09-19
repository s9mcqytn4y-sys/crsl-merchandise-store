---
name: alur-tdd
description: Alur kerja Test-Driven Development (Red-Green-Refactor) untuk pengembangan logika bisnis PHP dan interaktivitas JavaScript di CRSL Merchandise Store.
---

# Skill: Alur Kerja TDD (Test-Driven Development)

Gunakan skill ini ketika diminta membuat fitur baru, memodifikasi kalkulasi transaksi, atau memperbaiki bug kritis.

## Langkah-Langkah Siklus

### 1. Tentukan Spesifikasi & Siapkan Test (Fase RED)
- Buat berkas uji coba di `scratch/uji_<nama_fitur>.php`.
- Contoh struktur pengujian mandiri:
  ```php
  <?php
  require_once __DIR__ . '/../src/basis_data/PengelolaDatabase.php';
  require_once __DIR__ . '/../src/pesanan/PengelolaPesanan.php';

  $db = PengelolaDatabase::ambilKoneksi();
  $pengelola = new PengelolaPesanan($db);

  // Skenario: Kalkulasi diskon voucher
  $hasil = $pengelola->hitungDiskon('NEWADOPTER10', 100000);
  assert($hasil['potongan'] === 10000, "Potongan voucher harus 10.000");
  echo "Test RED berhasil didefinisikan.\n";
  ```
- Jalankan via terminal: `php scratch/uji_<nama_fitur>.php`.
- Pastikan pengujian gagal sebelum implementasi ditulis.

### 2. Tuliskan Implementasi Minimal (Fase GREEN)
- Buka berkas target di `src/` atau `publik/`.
- Tulis kode secukupnya agar kondisi pengujian terpenuhi.
- Jalankan kembali pengujian hingga menghasilkan status sukses tanpa error.

### 3. Refaktorisasi & Pembersihan (Fase REFACTOR)
- Rapikan struktur kode dan terapkan konvensi penamaan Bahasa Indonesia.
- Pastikan tidak ada duplikasi query atau manipulasi array yang tidak efisien.
- Jalankan kembali skrip pengujian untuk menjamin tidak ada regresi.
