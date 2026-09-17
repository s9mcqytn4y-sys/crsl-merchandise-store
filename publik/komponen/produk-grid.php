<?php
/**
 * Komponen Grid Produk Unggulan
 * Mengambil produk dari SQLite atau fallback data resmi CRSL
 */

// Coba ambil dari database jika tersedia
$daftarProduk = [];
try {
  $dbFile = dirname(__DIR__, 2) . '/data/toko.db';
  if (file_exists($dbFile)) {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->query("
      SELECT p.*, k.nama as nama_kategori
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      WHERE p.aktif = 1
      ORDER BY p.id ASC
    ");
    $daftarProduk = $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
} catch (Exception $e) {
  // Graceful fallback jika DB error
  $daftarProduk = [];
}

// Fallback jika database belum ada isinya
if (empty($daftarProduk)) {
  $daftarProduk = [
    [
      'id' => 1,
      'nama' => 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid',
      'nama_kategori' => 'Wallet & Accessories',
      'harga' => 199000,
      'harga_diskon' => 179100,
      'gambar_utama' => '/aset/gambar/cassie-wallet.webp',
      'varian' => '["CHILO PINK", "CHOCO BROWN"]'
    ],
    [
      'id' => 2,
      'nama' => 'CRSL Odin Fluffy Backpack | Tas Ransel Sekolah Dinosaurus Hijau',
      'nama_kategori' => 'Backpacks',
      'harga' => 329000,
      'harga_diskon' => 296100,
      'gambar_utama' => '/aset/gambar/banner-bts.webp',
      'varian' => '["ODIN GREEN", "POPO NAVY"]'
    ],
    [
      'id' => 3,
      'nama' => 'CRSL Chilo Canvas Slingbag | Tas Selempang Lucu Kucing Pink',
      'nama_kategori' => 'Slingbags',
      'harga' => 219000,
      'harga_diskon' => 197100,
      'gambar_utama' => '/aset/gambar/cassie-wallet.webp',
      'varian' => '["CHILO PINK", "CHOCO BROWN"]'
    ],
    [
      'id' => 4,
      'nama' => 'CRSL Popo Vacuum Tumbler 500ml | Stainless Steel Panda',
      'nama_kategori' => 'Tumbler Collection',
      'harga' => 189000,
      'harga_diskon' => 170100,
      'gambar_utama' => '/aset/gambar/banner-tumbler.webp',
      'varian' => '["POPO WHITE", "ODIN MINT"]'
    ],
    [
      'id' => 5,
      'nama' => 'CRSL Choco Oversized Hoodie | Jaket Hangat Beruang Cokelat',
      'nama_kategori' => 'Outerwears',
      'harga' => 389000,
      'harga_diskon' => 350100,
      'gambar_utama' => '/aset/gambar/banner-1.webp',
      'varian' => '["CHOCO BROWN", "PIGKO PEACH"]'
    ],
    [
      'id' => 6,
      'nama' => 'CRSL Pigko Cheerful Cap | Topi Baseball Karakter Peach Pig',
      'nama_kategori' => 'Headwears',
      'harga' => 149000,
      'harga_diskon' => 134100,
      'gambar_utama' => '/aset/gambar/banner-2.webp',
      'varian' => '["PIGKO PEACH", "ODIN OLIVE"]'
    ]
  ];
}
?>

<section class="produk-grid seksi-dinamis muncul-saat-scroll" id="produk-unggulan" aria-label="Produk Unggulan CRSL">
  <div class="produk-grid__header">
    <div class="produk-grid__header-kiri">
      <span class="produk-grid__tag">Best Sellers</span>
      <h2 class="produk-grid__judul">Koleksi Produk Terpopuler</h2>
      <p class="produk-grid__subjudul">Pilihan merchandise favorit para Adopter dengan diskon spesial 10%.</p>
    </div>
    <a href="/kategori/all-products" class="produk-grid__lihat-semua">
      <span>Lihat Semua Produk</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    </a>
  </div>

  <div class="produk-grid__wadah">
    <?php foreach ($daftarProduk as $p):
      $hargaPromo = $p['harga_diskon'] ?: $p['harga'];
      $adaDiskon = !empty($p['harga_diskon']) && $p['harga_diskon'] < $p['harga'];
      $diskonPersen = $adaDiskon ? round((($p['harga'] - $p['harga_diskon']) / $p['harga']) * 100) : 0;
      $gambar = !empty($p['gambar_utama']) ? $p['gambar_utama'] : '/aset/gambar/cassie-wallet.webp';
      $kategoriNama = !empty($p['nama_kategori']) ? $p['nama_kategori'] : 'Merchandise';
    ?>
      <article class="produk-kartu" data-id="<?= $p['id'] ?>">
        <!-- Gambar & Badge -->
        <div class="produk-kartu__gambar-wadah">
          <?php if ($adaDiskon): ?>
            <span class="produk-kartu__badge"><?= $diskonPersen ?>% OFF</span>
          <?php endif; ?>

          <img
            src="<?= htmlspecialchars($gambar) ?>"
            alt="<?= htmlspecialchars($p['nama']) ?>"
            class="produk-kartu__gambar"
            loading="lazy"
            width="300"
            height="300"
          >

          <!-- Tombol Quick Add to Cart -->
          <button
            type="button"
            class="produk-kartu__tombol-keranjang"
            aria-label="Tambah <?= htmlspecialchars($p['nama']) ?> ke keranjang"
            data-aksi="quick-cart"
            data-id="<?= $p['id'] ?>"
            data-nama="<?= htmlspecialchars($p['nama']) ?>"
            data-harga="<?= $hargaPromo ?>"
            data-harga-coret="<?= $p['harga'] ?>"
            data-gambar="<?= htmlspecialchars($gambar) ?>"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>
        </div>

        <!-- Rincian Produk -->
        <div class="produk-kartu__rincian">
          <span class="produk-kartu__kategori"><?= htmlspecialchars($kategoriNama) ?></span>
          <h3 class="produk-kartu__nama" title="<?= htmlspecialchars($p['nama']) ?>">
            <?= htmlspecialchars($p['nama']) ?>
          </h3>

          <div class="produk-kartu__harga-wadah">
            <span class="produk-kartu__harga-promo">Rp <?= number_format($hargaPromo, 0, ',', '.') ?></span>
            <?php if ($adaDiskon): ?>
              <span class="produk-kartu__harga-asli">Rp <?= number_format($p['harga'], 0, ',', '.') ?></span>
            <?php endif; ?>
          </div>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
</section>
