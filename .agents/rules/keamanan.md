# Aturan Keamanan (Security Rules) — CRSL Store v2

Aturan ini wajib dipatuhi oleh semua agen saat membaca, menulis, atau memodifikasi kode pada proyek ini.

## 1. Proteksi SQL Injection & Eloquent ORM
- **Wajib Eloquent / Query Builder**: Selalu gunakan Model Eloquent atau Query Builder Laravel dengan binding parameter otomatis.
- Dilarang keras melakukan konkatenasi variabel string secara langsung dalam `DB::raw()`.

## 2. Proteksi Cross-Site Scripting (XSS) & CSRF
- **Inertia & React Auto-Escaping**: React dan Inertia.js secara otomatis melakukan sanitasi pada data string.
- Jika menggunakan `dangerouslySetInnerHTML`, data wajib disanitasi menggunakan DOMPurify.
- **Proteksi CSRF**: Selalu aktifkan middleware CSRF bawaan Laravel untuk setiap request bermetode `POST`, `PUT`, `PATCH`, dan `DELETE`.

## 3. Validasi Form & Input Request
- Gunakan Laravel Form Request Validation atau `$request->validate()` untuk memvalidasi tipe data, format, dan batasan panjang input.
- Kalkulasi total belanja dan harga produk wajib dihitung ulang di server (backend) berdasarkan database `produk` & `produk_varian`, **bukan** mempercayai total harga dari client-side payload.

## 4. Keamanan Autentikasi & Sesi
- Sesi pengguna dikelola secara aman menggunakan driver `cache_sqlite`.
- Password di-hash menggunakan algoritma Bcrypt/Argon2 via `Hash::make()`.

## 5. Integrasi Gateways & Proteksi API Key
- API Key Biteship dan Midtrans Direct Charge Server Key diletakkan pada `.env` dan diakses melalui `config/services.php`.
- Dilarang keras menaruh secret key secara *hardcoded* di berkas PHP atau JavaScript.
- Verifikasi signature notification webhook dari Midtrans sebelum memperbarui status `pesanan_pembayaran`.
