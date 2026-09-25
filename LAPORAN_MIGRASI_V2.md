# Laporan Migrasi dan Screening CRSL Official Store v2

Tanggal: 25 September 2026  
Status: Selesai & Terverifikasi

---

## 1. Ringkasan Eksekutif

Re-build website e-commerce merchandise CRSL Store v2 berhasil dimigrasi dan diselaraskan sesuai instruksi komprehensif, referensi visual 5 tangkapan layar, konvensi penamaan Bahasa Indonesia, dan standar performa SQLite WAL /007.

Seluruh pengujian unit dan fitur telah lulus (`php artisan test`: 8 passed, 11 assertions), screening data dan skenario model diverifikasi via `php artisan tinker`, serta kompilasi TypeScript dan Vite selesai tanpa error (`npx tsc --noEmit` & `npm run build`).

---

## 2. Implementasi Konvensi Penamaan Bahasa Indonesia (Task 1)

1. **Pages & Components**:
   - `Catalog.tsx` -> `Katalog.tsx` (didukung dual alias di `Catalog.tsx` untuk backward compatibility).
   - `ProductDetail.tsx` -> `DetailProduk.tsx` (didukung dual alias di `ProductDetail.tsx`).
   - `Invoice.tsx` -> `Faktur.tsx` (didukung dual alias di `Invoice.tsx`).
   - `TrackOrder.tsx` -> `LacakPesanan.tsx` (didukung dual alias di `TrackOrder.tsx`).
   - `Account.tsx` -> `Akun.tsx` (didukung dual alias di `Account.tsx`).
   - `Checkout.tsx` -> `Pembayaran.tsx` (didukung dual alias di `Checkout.tsx`).
2. **Controllers & Inertia Rendering**:
   - `KatalogController.php` merender `'Katalog'` dan `'DetailProduk'`.
   - `PesananController.php` merender `'Faktur'` dan `'LacakPesanan'`.
   - `PembayaranController.php` merender `'Pembayaran'`.
   - `AkunController.php` merender `'Akun'`.
3. **Routing (`routes/web.php`)**:
   - `/katalog` dan `/catalog`
   - `/produk/{slug}` dan `/product/{slug}`
   - `/akun` dan `/account`
   - `/pembayaran` dan `/checkout`
   - `/pesanan/lacak` dan `/order/track`

---

## 3. Komponen Beranda: Seksi Pre-Order & Divider Banner (Task 2 & 7)

- Di bawah `HeroCarousel`, seksi **Pre-Order** diintegrasikan dari legacy `pre-order.php` dengan badge status `PRE-ORDER`, estimasi waktu produksi (PO timeline), countdown interaktif, dan tombol aksi langsung ke varian preorder.
- Aset divider banner `banner-bts-divider.webp` diintegrasikan sebagai separator visual transisi antar koleksi.
- Font styling diselaraskan dengan website resmi CRSL:
  - Heading: `Roboto`, sans-serif.
  - Body: `Open Sans`, sans-serif.
  - Seluruh font `jakarta-sans` telah digantikan secara konsisten.

---

## 4. UI Components Halaman Akun `/akun` (Task 4 & Screenshots 1-3)

Penyusunan modul-modul akun terbagi menjadi:
1. **Guest State**:
   - Kartu login/registrasi dengan keuntungan keanggotaan loyalty CRSL.
2. **Logged-in State (User: `abdul music`, `abdul@crsl-store.id`)**:
   - **Loyalty Card**: Menampilkan tier `New Freen`, saldo poin, dan progress belanja menuju tier `Bestfreen`.
   - **Reseller Access / Settings**: Menu navigasi profil, pengaturan alamat, dan akses program reseller.
   - **My Vouchers**: Daftar voucher aktif (`CRSLBESTIE10`, `FREEONGKIR20`) dengan tombol salin kode dan syarat minimal belanja.
   - **Filterable Orders List**: Tab status `Semua`, `Belum Bayar`, `Dikemas`, `Dikirim`, `Selesai`, `Dibatalkan`.
   - **Pesanan #TLTEY3004**: Menampilkan pesanan dibatalkan dengan produk *CRSL Drinke Tumblr Series DARK GREY 900ml / 32oz*, total Rp289.000.
   - **Wishlist Grid**: Daftar produk favorit tersimpan dengan status stok langsung dari database.

---

## 5. UI/UX Pembayaran & Checkout (Task 5 & Screenshot 5)

Halaman `Pembayaran.tsx` (`/pembayaran` dan `/checkout`):
1. **Header**: Tombol kembali `<` dan logo maskot CRSL BW (`/assets/gambar/logo-crsl-bw.webp`).
2. **Kolom Kiri**:
   - Informasi Penerima: `abdul music`, `+628567060477`, `Jakarta Pusat, Johar Baru`.
   - Checkbox Dropship: `[ ] Make as a dropship order`, membuka kolom Nama & Telepon Pengirim.
   - Metode Pengiriman: Alert box "Shipping is unavailable to this location. Contact us for help." dengan tautan WhatsApp CS `https://wa.me/6281234567890`, serta opsi fallback kurir (JNE, J&T, SiCepat).
   - Metode Pembayaran: Pilihan QRIS terpilih default dengan badge "Automated confirmation", serta opsi Transfer Virtual Account.
3. **Kolom Kanan (Ringkasan Pesanan)**:
   - Baris item: Thumbnail, Nama produk, Varian warna/ukuran, kuantitas, harga coret, dan harga aktif.
   - Kolom pesan: `Leave a message for delivery (Optional) >` yang dapat diperluas.
   - Voucher: `🏷️ Vouchers >` terintegrasi dengan modal pilihan kupon.
   - Poin Loyalitas: Saklar interaktif `Use Loyalty Point (P 0)`.
   - Rincian biaya: Subtotal, Diskon Produk, Ongkos Kirim, dan Total Pembayaran.
   - Jaminan keamanan: `🔒 Secure Payment | Your payment is encrypted.`
   - Catatan bea cukai / pajak untuk pengiriman internasional.
   - CTA utama: Tombol hitam gelap `#1e293b` `Order Now`.

---

## 6. Cart Drawer & Skenario Stok (Task 6 & Screenshot 4)

- Badge stok menipis: `Only 5 stocks left` dengan warna peringatan amber.
- Badge diskon persentase langsung pada thumbnail item.
- Progress bar loyalitas: Menampilkan penambahan poin reward setelah checkout.
- Tombol Checkout Kuning `#eab308`: `Checkout with Discount` dengan kontras WCAG AA compliant.

---

## 7. Database & Standar Keandalan SQLite WAL (Task 7 & Rule /007)

- Database SQLite lokal `database/database.sqlite` berjalan dalam mode:
  - `PRAGMA journal_mode = WAL;`
  - `PRAGMA synchronous = NORMAL;`
  - `PRAGMA busy_timeout = 5000;`
  - `transaction_mode = DEFERRED;`
- Hubungan relasi pada model `User`:
  - `loyalitas()` -> `hasOne(PenggunaLoyalitas::class)`
  - `alamat()` -> `hasMany(AlamatPengguna::class)`
  - `pesanan()` -> `hasMany(Pesanan::class)`
  - `wishlist()` -> `hasMany(Wishlist::class)`
- Hubungan relasi pada model `Pesanan`:
  - `items()` & `item()` -> `hasMany(ItemPesanan::class)`

---

## 8. Verifikasi Fungsional via Tinker (Task 3)

Hasil screening via `php artisan tinker --execute="..."`:
```text
=== SCREENING USER & LOYALITAS ===
User: abdul music | Tier: New Freen | Points: 0
Alamat: abdul music | +628567060477 | Jakarta Pusat, Johar Baru, johar baru johar baru

=== SCREENING PESANAN #TLTEY3004 (SCREENSHOT 3) ===
Nomor: #TLTEY3004 | Status: dibatalkan | Total: Rp289.000
Item: CRSL Drinke Tumblr Series | Botol Tempat minum | Tumbler | Tumbler Travel Bottle Stainless 900ml 32oz | Varian: DARK GREY | Ukuran: 900ml / 32oz

=== SCREENING PRODUK & PRE-ORDER ===
ID: 1 | CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid | Rp199.000 | Kategori: Wallet & Accessories | Varian: 3
ID: 2 | CRSL Odin Fluffy Backpack | Tas Ransel Sekolah Dinosaurus Hijau | Rp329.000 | Kategori: Backpacks | Varian: 0
ID: 3 | CRSL Chilo Canvas Slingbag | Tas Selempang Lucu Kucing Pink | Rp219.000 | Kategori: Slingbags | Varian: 0
ID: 4 | CRSL Popo Vacuum Tumbler 500ml | Stainless Steel Panda | Rp189.000 | Kategori: Tumbler Collection | Varian: 0
ID: 5 | CRSL Choco Oversized Hoodie | Jaket Hangat Beruang Cokelat | Rp389.000 | Kategori: Outerwears | Varian: 0
ID: 6 | CRSL Pigko Cheerful Cap | Topi Baseball Karakter Peach Pig | Rp149.000 | Kategori: Headwears | Varian: 0
ID: 7 | CRSL Drinke Tumblr Series | Botol Tempat Minum Stainless 900ml | Rp289.000 | Kategori: Tumbler Collection | Varian: 5

=== SCREENING VOUCHER ===
Kode: CRSLBESTIE10 | Diskon Sahabat 10% | Diskon: 10% | Min: Rp100.000
Kode: FREEONGKIR20 | Potongan Ongkir Rp20.000 | Diskon: 20000 IDR | Min: Rp150.000
```

---

## 9. Aturan Antislop & Aksesibilitas

- **Zero Em Dashes**: Tidak ada karakter em dash (`—`). Semua menggunakan tanda hubung `-`.
- **Scrollbar Hidden**: Properti CSS global menyembunyikan scrollbar tanpa merusak fungsionalitas scroll touch/mouse:
  ```css
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  *::-webkit-scrollbar {
    display: none !important;
  }
  ```
- **WCAG AA Compliance**: Seluruh teks, badge, dan kontrol memiliki rasio kontras >= 4.5:1.
- **No Dead Links**: Semua navigasi dan tombol memiliki aksi atau tujuan valid.
