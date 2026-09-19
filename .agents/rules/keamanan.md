# Aturan Keamanan (Security Rules) - CRSL Merchandise Store

Aturan ini wajib dipatuhi oleh semua agen saat membaca, menulis, atau memodifikasi kode pada proyek ini.

## 1. Pencegahan SQL Injection
- **Wajib PDO Prepared Statements**: Jangan pernah menggabungkan variabel langsung ke dalam query SQL via konkatenasi string.
- Gunakan placeholder bernama (`:produk_id`, `:email`) atau positional (`?`).
- Contoh aman:
  ```php
  $stmt = $db->prepare("SELECT * FROM produk WHERE id = :id AND status = 'aktif'");
  $stmt->execute([':id' => $produkId]);
  $produk = $stmt->fetch();
  ```

## 2. Pencegahan Cross-Site Scripting (XSS)
- **Wajib Sanitasi Output**: Setiap data yang bersumber dari pengguna atau basis data yang dicetak ke dalam template HTML wajib dibungkus dengan `htmlspecialchars()`.
  ```php
  <?= htmlspecialchars($produk['nama'] ?? '', ENT_QUOTES, 'UTF-8') ?>
  ```
- Hindari menyuntikkan HTML mentah (`innerHTML`) di JavaScript tanpa sanitasi ketat. Gunakan `textContent` atau sanitasi DOM.

## 3. Validasi & Sanitasi Input
- Validasi tipe data, format, dan batasan panjang untuk semua parameter input dari `$_GET`, `$_POST`, atau JSON payload (`file_get_contents('php://input')`).
- Angka wajib dicasting ke `(int)` atau `(float)`:
  ```php
  $kuantitas = max(1, min(100, (int)($_POST['kuantitas'] ?? 1)));
  ```
- Alamat email wajib divalidasi dengan `filter_var($email, FILTER_VALIDATE_EMAIL)`.

## 4. Keamanan Autentikasi & Kata Sandi
- Simpan password hanya menggunakan fungsi hashing modern: `password_hash($password, PASSWORD_DEFAULT)`.
- Verifikasi password hanya dengan `password_verify($inputPassword, $hash)`.
- Jangan pernah menyimpan password dalam bentuk teks polos (plain text).

## 5. Proteksi Data Sensitif & Kredensial
- Dilarang keras menaruh API key, secret token, password basis data, atau kredensial pribadi di dalam kode sumber yang di-commit ke repositori git.
- Gunakan environment variables atau konfigurasi lokal yang dikecualikan di `.gitignore`.
- Jangan mencetak data sensitif (password hash, token sesi) ke dalam log aplikasi publik atau output JSON.

## 6. Penanganan Error yang Aman
- Di lingkungan produksi, jangan tampilkan stack trace atau detail error internal basis data kepada pengguna publik.
- Catat detail error ke dalam log server, dan tampilkan pesan umum yang ramah kepada pengguna:
  ```php
  http_response_code(500);
  echo json_encode(['sukses' => false, 'pesan' => 'Terjadi kendala pada sistem. Silakan coba lagi nanti.']);
  ```
