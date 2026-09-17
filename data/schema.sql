BEGIN TRANSACTION;
CREATE TABLE gambar_produk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produk_id INTEGER NOT NULL REFERENCES produk(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_teks TEXT,
  urutan INTEGER DEFAULT 0
);
INSERT INTO "gambar_produk" VALUES(1,1,'/aset/gambar/cassie-wallet.webp','CRSL Cassie Wallet Tampilan Depan',1);
INSERT INTO "gambar_produk" VALUES(2,1,'/aset/gambar/banner-cassie.webp','CRSL Cassie Wallet Motif Plaid & Kompartemen',2);
INSERT INTO "gambar_produk" VALUES(3,1,'/aset/gambar/banner-1.webp','CRSL Cassie Wallet Model Lifestyle',3);
INSERT INTO "gambar_produk" VALUES(4,2,'/aset/gambar/banner-bts.webp','CRSL Odin Backpack Tampak Depan',1);
INSERT INTO "gambar_produk" VALUES(5,2,'/aset/gambar/banner-2.webp','CRSL Odin Backpack Dipakai Model',2);
INSERT INTO "gambar_produk" VALUES(6,2,'/aset/gambar/banner-1.webp','CRSL Odin Backpack Detail Resleting & Bahan',3);
INSERT INTO "gambar_produk" VALUES(7,3,'/aset/gambar/cassie-wallet.webp','CRSL Chilo Slingbag Depan',1);
INSERT INTO "gambar_produk" VALUES(8,3,'/aset/gambar/banner-2.webp','CRSL Chilo Slingbag Detail Tali Selempang',2);
INSERT INTO "gambar_produk" VALUES(9,4,'/aset/gambar/banner-tumbler.webp','CRSL Popo Vacuum Tumbler 500ml',1);
INSERT INTO "gambar_produk" VALUES(10,4,'/aset/gambar/drinke-tumblr.webp','CRSL Popo Vacuum Tumbler Detail Insulasi',2);
INSERT INTO "gambar_produk" VALUES(11,5,'/aset/gambar/banner-1.webp','CRSL Choco Oversized Hoodie Tampilan Penuh',1);
INSERT INTO "gambar_produk" VALUES(12,5,'/aset/gambar/banner-2.webp','CRSL Choco Hoodie Bordir Karakter',2);
INSERT INTO "gambar_produk" VALUES(13,6,'/aset/gambar/banner-2.webp','CRSL Pigko Cap Tampak Depan',1);
INSERT INTO "gambar_produk" VALUES(14,6,'/aset/gambar/banner-1.webp','CRSL Pigko Cap Strap Belakang',2);
INSERT INTO "gambar_produk" VALUES(15,7,'/aset/gambar/drinke-tumblr.webp','CRSL Drinke Tumblr Series 5 Karakter',1);
INSERT INTO "gambar_produk" VALUES(16,7,'/aset/gambar/banner-tumbler.webp','CRSL Drinke Tumblr Series Retensi Dingin 12 Jam',2);
INSERT INTO "gambar_produk" VALUES(17,7,'/aset/gambar/banner-bts.webp','CRSL Drinke Tumblr Series Detail Silicone Straw',3);
CREATE TABLE item_pesanan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pesanan_id INTEGER NOT NULL REFERENCES pesanan(id) ON DELETE CASCADE,
  produk_id INTEGER NOT NULL REFERENCES produk(id),
  nama_produk TEXT NOT NULL,
  harga INTEGER NOT NULL,
  jumlah INTEGER NOT NULL DEFAULT 1,
  ukuran TEXT,
  warna TEXT
);
CREATE TABLE kategori (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  deskripsi TEXT,
  emoji TEXT,
  urutan INTEGER DEFAULT 0,
  aktif INTEGER DEFAULT 1,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "kategori" VALUES(1,'BTS Collection','back-to-school-essentials',NULL,'🎒',1,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(2,'All Products','all-products',NULL,NULL,2,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(3,'All Day Promo','discounts',NULL,'🔥',3,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(4,'Backpacks','backpack-collection',NULL,NULL,4,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(5,'Slingbags','slingbag-collection',NULL,NULL,5,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(6,'Tumbler Collection','tumbler-collection',NULL,NULL,6,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(7,'Tops','tops-collection',NULL,NULL,7,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(8,'Bottoms','bottoms-collection',NULL,NULL,8,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(9,'Outerwears','outerwears-collection',NULL,NULL,9,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(10,'Footwears','footwear-collection',NULL,NULL,10,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(11,'Headwears','headwear-collection',NULL,NULL,11,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(12,'Wallet & Accessories','wallet-accessories',NULL,NULL,12,1,'2026-09-17 15:27:29');
INSERT INTO "kategori" VALUES(13,'What''s Poppin''','whats-poppin',NULL,NULL,13,1,'2026-09-17 15:27:29');
CREATE TABLE pengguna (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_lengkap TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  kata_sandi TEXT NOT NULL,
  tanggal_lahir DATE,
  peran TEXT DEFAULT 'anggota' CHECK(peran IN ('anggota', 'admin')),
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE pesanan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pengguna_id INTEGER NOT NULL REFERENCES pengguna(id),
  nomor_pesanan TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'belum_bayar' CHECK(status IN (
    'belum_bayar', 'akan_dikirim', 'dikirim', 'selesai', 'dibatalkan', 'dikembalikan'
  )),
  total INTEGER NOT NULL,
  mata_uang TEXT DEFAULT 'IDR',
  alamat_kirim TEXT,
  metode_bayar TEXT,
  catatan TEXT,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE produk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kategori_id INTEGER REFERENCES kategori(id),
  nama TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  deskripsi TEXT,
  harga INTEGER NOT NULL,
  harga_diskon INTEGER,
  stok INTEGER DEFAULT 0,
  gambar_utama TEXT,
  aktif INTEGER DEFAULT 1,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "produk" VALUES(1,12,'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid','crsl-cassie-wallet','Dompet lipat stylish motif plaid dengan pilihan varian Chilo Pink dan Choco Brown. Ringkas, awet, dan fungsional untuk kartu serta uang harian.',199000,179100,50,'/aset/gambar/cassie-wallet.webp',1,'2026-09-17 17:25:04','2026-09-17 17:25:04');
INSERT INTO "produk" VALUES(2,4,'CRSL Odin Fluffy Backpack | Tas Ransel Sekolah Dinosaurus Hijau','crsl-odin-fluffy-backpack','Ransel kapasitas besar dengan kompartemen laptop 14 inci, bahan water-repellent, dan aksen karakter Odin si Dinosaurus petualang.',329000,296100,35,'/aset/gambar/banner-bts.webp',1,'2026-09-17 17:25:04','2026-09-17 17:25:04');
INSERT INTO "produk" VALUES(3,5,'CRSL Chilo Canvas Slingbag | Tas Selempang Lucu Kucing Pink','crsl-chilo-canvas-slingbag','Slingbag praktis berbahan kanvas premium dengan bordir karakter Chilo si Kucing imut. Pas untuk hangout harian.',219000,197100,40,'/aset/gambar/cassie-wallet.webp',1,'2026-09-17 17:25:04','2026-09-17 17:25:04');
INSERT INTO "produk" VALUES(4,6,'CRSL Popo Vacuum Tumbler 500ml | Stainless Steel Panda','crsl-popo-vacuum-tumbler','Tumbler termos tahan panas dan dingin hingga 12 jam. Desain minimalis dengan grafis Popo si Panda santai.',189000,170100,60,'/aset/gambar/banner-tumbler.webp',1,'2026-09-17 17:25:04','2026-09-17 17:25:04');
INSERT INTO "produk" VALUES(5,9,'CRSL Choco Oversized Hoodie | Jaket Hangat Beruang Cokelat','crsl-choco-oversized-hoodie','Hoodie oversized bahan fleece katun lembut yang nyaman dan hangat. Dilengkapi patch karakter Choco di dada.',389000,350100,25,'/aset/gambar/banner-1.webp',1,'2026-09-17 17:25:04','2026-09-17 17:25:04');
INSERT INTO "produk" VALUES(6,11,'CRSL Pigko Cheerful Cap | Topi Baseball Karakter Peach Pig','crsl-pigko-cheerful-cap','Topi baseball kasual dengan strap adjustable di belakang dan bordir presisi Pigko si Babi ceria.',149000,134100,45,'/aset/gambar/banner-2.webp',1,'2026-09-17 17:25:04','2026-09-17 17:25:04');
INSERT INTO "produk" VALUES(7,6,'CRSL Drinke Tumblr Series | Botol Tempat Minum Stainless 900ml','crsl-drinke-tumblr-series','Miliki koleksi Drinke Tumblr Series 900ml eksklusif dengan 5 karakter sahabat CRSL. Menjaga suhu minuman tetap dingin hingga 12 jam, dirancang tahan bocor dan siap menemani petualangan harianmu.',289000,289000,445,'/aset/gambar/drinke-tumblr.webp',1,'2026-09-17 18:47:22','2026-09-17 18:47:22');
CREATE TABLE produk_spesifikasi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produk_id INTEGER NOT NULL REFERENCES produk(id) ON DELETE CASCADE,
        kunci TEXT NOT NULL,
        nilai TEXT NOT NULL,
        urutan INTEGER DEFAULT 0
    );
INSERT INTO "produk_spesifikasi" VALUES(1,1,'Material','Kanvas Tebal Berkualitas Tinggi dengan Sablon Presisi',1);
INSERT INTO "produk_spesifikasi" VALUES(2,1,'Dimensi','11.5 cm x 9.5 cm x 2.0 cm',2);
INSERT INTO "produk_spesifikasi" VALUES(3,1,'Kompartemen','5 Slot Kartu, 1 Slot Uang Kertas, 1 Kantong Koin Ritsleting YKK',3);
INSERT INTO "produk_spesifikasi" VALUES(4,1,'Garansi','Garansi 7 Hari Penggantian Baru (Cacat Produksi)',4);
INSERT INTO "produk_spesifikasi" VALUES(5,7,'Material','Food Grade SUS 304 Stainless Steel (BPA Free)',1);
INSERT INTO "produk_spesifikasi" VALUES(6,7,'Kapasitas','900 ml / 32 oz',2);
INSERT INTO "produk_spesifikasi" VALUES(7,7,'Retensi Suhu','Dingin hingga 12 Jam, Hangat hingga 8 Jam',3);
INSERT INTO "produk_spesifikasi" VALUES(8,7,'Tutup','Leak-Proof Twist Lid dengan Silicone Straw Reusable',4);
INSERT INTO "produk_spesifikasi" VALUES(9,7,'Bonus','Exclusive Sticker Pack 5 Karakter Sahabat CRSL',5);
INSERT INTO "produk_spesifikasi" VALUES(10,2,'Material','Polyester Cordura Water-Repellent',1);
INSERT INTO "produk_spesifikasi" VALUES(11,2,'Kapasitas','20 Liter (Muat Laptop hingga 14 Inci)',2);
INSERT INTO "produk_spesifikasi" VALUES(12,2,'Kompartemen','Kompartemen Utama Berbusa, 2 Kantong Samping Botol Minum',3);
INSERT INTO "produk_spesifikasi" VALUES(13,5,'Bahan','Heavyweight Cotton Fleece 330 GSM',1);
INSERT INTO "produk_spesifikasi" VALUES(14,5,'Fitting','Relaxed Oversized Cut',2);
INSERT INTO "produk_spesifikasi" VALUES(15,5,'Detail','High-Density Character Embroidery & Kangaroo Pocket',3);
CREATE TABLE produk_varian (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produk_id INTEGER NOT NULL REFERENCES produk(id) ON DELETE CASCADE,
        sku TEXT UNIQUE NOT NULL,
        nama_varian TEXT NOT NULL,
        tipe_varian TEXT DEFAULT 'warna',
        atribut_ukuran TEXT,
        harga_tambahan INTEGER DEFAULT 0,
        stok INTEGER NOT NULL DEFAULT 50,
        gambar_varian TEXT,
        aktif INTEGER DEFAULT 1,
        dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO "produk_varian" VALUES(1,1,'CRSL-WLT-CASSIE-PNK','CHILO PINK','warna','All Size',0,45,'/aset/gambar/cassie-wallet.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(2,1,'CRSL-WLT-CASSIE-BRN','CHOCO BROWN','warna','All Size',0,30,'/aset/gambar/cassie-wallet.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(3,1,'CRSL-WLT-CASSIE-GRN','ODIN GREEN','warna','All Size',0,20,'/aset/gambar/cassie-wallet.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(4,7,'CRSL-TMB-DRN-32-CHILO','CHILO PINK','karakter','900ml / 32oz',0,100,'/aset/gambar/drinke-tumblr.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(5,7,'CRSL-TMB-DRN-32-POPO','POPO BLUE','karakter','900ml / 32oz',0,100,'/aset/gambar/drinke-tumblr.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(6,7,'CRSL-TMB-DRN-32-ODIN','ODIN YELLOW','karakter','900ml / 32oz',0,80,'/aset/gambar/drinke-tumblr.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(7,7,'CRSL-TMB-DRN-32-CHOCO','CHOCO GREY','karakter','900ml / 32oz',0,75,'/aset/gambar/drinke-tumblr.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(8,7,'CRSL-TMB-DRN-32-PIGKO','PIGKO PEACH','karakter','900ml / 32oz',0,90,'/aset/gambar/drinke-tumblr.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(9,2,'CRSL-BCK-ODIN-GRN-14','ODIN GREEN','warna','Laptop 14 Inch',0,25,'/aset/gambar/banner-bts.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(10,2,'CRSL-BCK-POPO-NVY-14','POPO NAVY','warna','Laptop 14 Inch',0,15,'/aset/gambar/banner-bts.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(11,3,'CRSL-SLG-CHILO-PNK','CHILO PINK','warna','Reguler',0,50,'/aset/gambar/cassie-wallet.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(12,3,'CRSL-SLG-CHOCO-BRN','CHOCO BROWN','warna','Reguler',0,40,'/aset/gambar/cassie-wallet.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(13,4,'CRSL-TMB-POPO-500-BLU','POPO BLUE','warna','500ml',0,60,'/aset/gambar/banner-tumbler.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(14,4,'CRSL-TMB-CHILO-500-PNK','CHILO PINK','warna','500ml',0,35,'/aset/gambar/banner-tumbler.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(15,5,'CRSL-APP-HOD-CHOCO-M','CHOCO BROWN','ukuran','M',0,20,'/aset/gambar/banner-1.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(16,5,'CRSL-APP-HOD-CHOCO-L','CHOCO BROWN','ukuran','L',0,25,'/aset/gambar/banner-1.webp',1,'2026-09-17 18:47:22');
INSERT INTO "produk_varian" VALUES(17,5,'CRSL-APP-HOD-CHOCO-XL','CHOCO BROWN','ukuran','XL',15000,15,'/aset/gambar/banner-1.webp',1,'2026-09-17 18:47:22');
CREATE TABLE wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pengguna_id INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  produk_id INTEGER NOT NULL REFERENCES produk(id) ON DELETE CASCADE,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pengguna_id, produk_id)
);
CREATE INDEX idx_produk_kategori ON produk(kategori_id);
CREATE INDEX idx_produk_slug ON produk(slug);
CREATE INDEX idx_pesanan_pengguna ON pesanan(pengguna_id);
CREATE INDEX idx_pesanan_status ON pesanan(status);
CREATE INDEX idx_wishlist_pengguna ON wishlist(pengguna_id);
DELETE FROM "sqlite_sequence";
INSERT INTO "sqlite_sequence" VALUES('kategori',13);
INSERT INTO "sqlite_sequence" VALUES('produk',7);
INSERT INTO "sqlite_sequence" VALUES('produk_varian',17);
INSERT INTO "sqlite_sequence" VALUES('produk_spesifikasi',15);
INSERT INTO "sqlite_sequence" VALUES('gambar_produk',17);
COMMIT;
