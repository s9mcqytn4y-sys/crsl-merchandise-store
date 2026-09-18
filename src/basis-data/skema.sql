-- ==========================================================
-- CRSL Merchandise Store - SQLite Schema
-- ==========================================================

-- Pengguna / Users
CREATE TABLE IF NOT EXISTS pengguna (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_lengkap TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  kata_sandi TEXT NOT NULL,
  tanggal_lahir DATE,
  peran TEXT DEFAULT 'anggota' CHECK(peran IN ('anggota', 'admin')),
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Kategori Produk
CREATE TABLE IF NOT EXISTS kategori (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  deskripsi TEXT,
  emoji TEXT,
  urutan INTEGER DEFAULT 0,
  aktif INTEGER DEFAULT 1,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Produk
CREATE TABLE IF NOT EXISTS produk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kategori_id INTEGER REFERENCES kategori(id),
  nama TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  deskripsi TEXT,
  harga INTEGER NOT NULL,
  harga_diskon INTEGER,
  stok INTEGER DEFAULT 0,
  berat INTEGER DEFAULT 250,
  tipe_produk TEXT DEFAULT 'regular' CHECK(tipe_produk IN ('regular', 'pre_order', 'bundle')),
  estimasi_po TEXT,
  status_stok TEXT DEFAULT 'in_stock' CHECK(status_stok IN ('in_stock', 'low_stock', 'sold_out')),
  gambar_utama TEXT,
  aktif INTEGER DEFAULT 1,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gambar Galeri Produk
CREATE TABLE IF NOT EXISTS gambar_produk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produk_id INTEGER NOT NULL REFERENCES produk(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_teks TEXT,
  urutan INTEGER DEFAULT 0
);

-- Varian SKU Produk (Warna, Ukuran, Stok)
CREATE TABLE IF NOT EXISTS produk_varian (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produk_id INTEGER NOT NULL REFERENCES produk(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  warna TEXT,
  warna_hex TEXT,
  warna_gambar TEXT,
  ukuran TEXT,
  stok INTEGER DEFAULT 0,
  harga_override INTEGER,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pengguna_id INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  produk_id INTEGER NOT NULL REFERENCES produk(id) ON DELETE CASCADE,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pengguna_id, produk_id)
);

-- Pesanan / Orders
CREATE TABLE IF NOT EXISTS pesanan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pengguna_id INTEGER NOT NULL REFERENCES pengguna(id),
  nomor_pesanan TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'belum_bayar' CHECK(status IN (
    'belum_bayar', 'akan_dikirim', 'dikirim', 'selesai', 'dibatalkan', 'dikembalikan'
  )),
  total INTEGER NOT NULL,
  ongkir INTEGER DEFAULT 0,
  kurir TEXT,
  nomor_resi TEXT,
  mata_uang TEXT DEFAULT 'IDR',
  alamat_kirim TEXT,
  metode_bayar TEXT,
  catatan TEXT,
  item_json TEXT,
  waktu_bayar DATETIME,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Item Pesanan
CREATE TABLE IF NOT EXISTS item_pesanan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pesanan_id INTEGER NOT NULL REFERENCES pesanan(id) ON DELETE CASCADE,
  produk_id INTEGER NOT NULL REFERENCES produk(id),
  nama_produk TEXT NOT NULL,
  harga INTEGER NOT NULL,
  jumlah INTEGER NOT NULL DEFAULT 1,
  ukuran TEXT,
  warna TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_produk_kategori ON produk(kategori_id);
CREATE INDEX IF NOT EXISTS idx_produk_slug ON produk(slug);
CREATE INDEX IF NOT EXISTS idx_pesanan_pengguna ON pesanan(pengguna_id);
CREATE INDEX IF NOT EXISTS idx_pesanan_status ON pesanan(status);
CREATE INDEX IF NOT EXISTS idx_wishlist_pengguna ON wishlist(pengguna_id);
