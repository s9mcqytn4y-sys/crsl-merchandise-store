<?php
/**
 * CRSL Merchandise Store - Halaman Detail Produk (PDP)
 * Fase 3: Swiper Galeri + Lightbox Zoom, Matriks SKU Dinamis,
 * Exclusive Accordion, & Sticky Mobile Bottom Bar
 */

$slug = $produkSlug ?? 'crsl-cassie-wallet';

// Ambil data produk dari database SQLite
$produk = null;
$gambarGaleri = [];
$varianList = [];
$spesifikasiList = [];

try {
  $dbFile = dirname(__DIR__, 2) . '/data/toko.db';
  if (file_exists($dbFile)) {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Kueri produk
    $stmt = $db->prepare("
      SELECT p.*, k.nama as nama_kategori, k.slug as slug_kategori
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      WHERE p.slug = ? AND p.aktif = 1
    ");
    $stmt->execute([$slug]);
    $produk = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($produk) {
      // Kueri galeri gambar
      $stmtGbr = $db->prepare("SELECT url, alt_teks FROM gambar_produk WHERE produk_id = ? ORDER BY urutan ASC");
      $stmtGbr->execute([$produk['id']]);
      $gambarGaleri = $stmtGbr->fetchAll(PDO::FETCH_ASSOC);

      // Kueri varian SKU
      $stmtVar = $db->prepare("SELECT * FROM produk_varian WHERE produk_id = ? AND aktif = 1 ORDER BY id ASC");
      $stmtVar->execute([$produk['id']]);
      $varianList = $stmtVar->fetchAll(PDO::FETCH_ASSOC);

      // Kueri spesifikasi
      $stmtSpek = $db->prepare("SELECT kunci, nilai FROM produk_spesifikasi WHERE produk_id = ? ORDER BY urutan ASC");
      $stmtSpek->execute([$produk['id']]);
      $spesifikasiList = $stmtSpek->fetchAll(PDO::FETCH_ASSOC);
    }
  }
} catch (Exception $e) {
  // Graceful fallback
}

// Fallback jika tidak ditemukan
if (!$produk) {
  $produk = [
    'id' => 1,
    'nama' => 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid',
    'slug' => 'crsl-cassie-wallet',
    'nama_kategori' => 'Wallet & Accessories',
    'slug_kategori' => 'wallet-accessories',
    'harga' => 199000,
    'harga_diskon' => 179100,
    'gambar_utama' => '/aset/gambar/cassie-wallet.webp',
    'deskripsi' => 'Dompet lipat kanvas kasual dengan sentuhan pola plaid yang unik dan stylish. Didesain ramping namun multifungsi untuk memuat kartu, uang kertas, dan koin Anda.'
  ];
  $gambarGaleri = [
    ['url' => '/aset/gambar/cassie-wallet.webp', 'alt_teks' => 'CRSL Cassie Wallet Tampilan Utama'],
    ['url' => '/aset/gambar/banner-cassie.webp', 'alt_teks' => 'CRSL Cassie Wallet Motif Plaid'],
    ['url' => '/aset/gambar/banner-1.webp', 'alt_teks' => 'CRSL Cassie Wallet Lifestyle']
  ];
  $varianList = [
    ['sku' => 'CRSL-WLT-CASSIE-PNK', 'nama_varian' => 'CHILO PINK', 'atribut_ukuran' => 'All Size', 'harga_tambahan' => 0, 'stok' => 45],
    ['sku' => 'CRSL-WLT-CASSIE-BRN', 'nama_varian' => 'CHOCO BROWN', 'atribut_ukuran' => 'All Size', 'harga_tambahan' => 0, 'stok' => 30],
    ['sku' => 'CRSL-WLT-CASSIE-GRN', 'nama_varian' => 'ODIN GREEN', 'atribut_ukuran' => 'All Size', 'harga_tambahan' => 0, 'stok' => 20]
  ];
  $spesifikasiList = [
    ['kunci' => 'Material', 'nilai' => 'Kanvas Premium Tebal & Halus'],
    ['kunci' => 'Dimensi', 'nilai' => '11.5 cm x 9.5 cm x 2.0 cm'],
    ['kunci' => 'Kompartemen', 'nilai' => '5 Slot Kartu + 1 Slot Uang Kertas + 1 Kantong Koin Ritsleting YKK'],
    ['kunci' => 'Garansi', 'nilai' => 'Garansi 7 Hari Penggantian Baru (Cacat Produksi)']
  ];
}

$hargaAktif = $produk['harga_diskon'] ?: $produk['harga'];
$apakahDiskon = $produk['harga_diskon'] && $produk['harga_diskon'] < $produk['harga'];
?>
<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($produk['nama']) ?> - CRSL Official</title>
  <meta name="description" content="<?= htmlspecialchars(substr($produk['deskripsi'] ?? $produk['nama'], 0, 160)) ?>">

  <!-- Open Graph & SEO -->
  <meta property="og:title" content="<?= htmlspecialchars($produk['nama']) ?>">
  <meta property="og:description" content="<?= htmlspecialchars(substr($produk['deskripsi'] ?? $produk['nama'], 0, 160)) ?>">
  <meta property="og:type" content="product">
  <meta property="og:image" content="<?= htmlspecialchars($produk['gambar_utama']) ?>">
  <meta property="og:url" content="<?= APP_URL ?>/produk/<?= htmlspecialchars($produk['slug']) ?>">

  <!-- CSS Core & Komponen -->
  <link rel="stylesheet" href="/css/variabel.css">
  <link rel="stylesheet" href="/css/dasar.css">
  <link rel="stylesheet" href="/css/tata-letak.css">
  <link rel="stylesheet" href="/css/komponen/bilah-atas.css">
  <link rel="stylesheet" href="/css/komponen/navigasi.css">
  <link rel="stylesheet" href="/css/komponen/menu-samping.css">
  <link rel="stylesheet" href="/css/komponen/pencarian.css">
  <link rel="stylesheet" href="/css/komponen/preferensi.css">
  <link rel="stylesheet" href="/css/komponen/keranjang.css">
  <link rel="stylesheet" href="/css/komponen/cta-mengambang.css">
  <link rel="stylesheet" href="/css/komponen/otentikasi.css">
  <link rel="stylesheet" href="/css/halaman/produk.css">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "<?= htmlspecialchars($produk['nama']) ?>",
    "image": "<?= htmlspecialchars($produk['gambar_utama']) ?>",
    "description": "<?= htmlspecialchars($produk['deskripsi'] ?? $produk['nama']) ?>",
    "brand": {
      "@type": "Brand",
      "name": "CRSL"
    },
    "offers": {
      "@type": "Offer",
      "url": "<?= APP_URL ?>/produk/<?= htmlspecialchars($produk['slug']) ?>",
      "priceCurrency": "IDR",
      "price": "<?= $hargaAktif ?>",
      "availability": "https://schema.org/InStock"
    }
  }
  </script>
</head>
<body>
  <!-- Skip Navigation -->
  <a href="#konten-utama" class="lewati-navigasi">Lewati ke konten utama</a>

  <!-- ========== BILAH ATAS ========== -->
  <div class="bilah-atas" role="region" aria-label="Pengumuman promo">
    <div class="bilah-atas__rotator"></div>
  </div>

  <!-- ========== NAVIGASI ========== -->
  <header class="navigasi" role="banner">
    <div class="navigasi__wadah">
      <div class="navigasi__kiri">
        <button type="button" id="tombol-menu" class="navigasi__tombol-ikon" aria-label="Buka menu navigasi" aria-expanded="false" aria-controls="menu-samping">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
      <div class="navigasi__tengah">
        <a href="/" class="navigasi__logo" aria-label="CRSL - Kembali ke beranda">
          <img src="/aset/gambar/logo-crsl.png" alt="CRSL Official" class="navigasi__logo-gambar" width="120" height="32" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';">
          <span class="navigasi__logo-teks" style="display:none;">CRSL</span>
        </a>
      </div>
      <div class="navigasi__kanan">
        <button type="button" id="tombol-tema" class="navigasi__tombol-ikon" aria-label="Ganti tema">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button type="button" id="tombol-preferensi" class="navigasi__preferensi" aria-label="Pengaturan lokalisasi" aria-expanded="false" aria-controls="preferensi">
          <img id="bendera-navigasi" src="/aset/ikon/bendera-id.svg" alt="Bendera Indonesia" class="navigasi__bendera" width="20" height="14">
          <span id="teks-mata-uang" class="navigasi__mata-uang">IDR</span>
        </button>
        <button type="button" id="tombol-cari" class="navigasi__tombol-ikon" aria-label="Buka pencarian">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <a href="/akun" class="navigasi__tombol-ikon" aria-label="Akun saya">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- ========== DRAWER MENU & OVERLAYS ========== -->
  <div id="menu-samping-overlay" class="menu-samping__overlay" aria-hidden="true"></div>
  <nav id="menu-samping" class="menu-samping" role="dialog" aria-modal="true" aria-label="Menu navigasi" aria-hidden="true">
    <div class="menu-samping__header">
      <button type="button" id="tombol-cari-drawer" class="menu-samping__tombol-cari" aria-label="Buka pencarian">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
      <button type="button" id="tombol-tutup-menu" class="menu-samping__tombol-tutup" aria-label="Tutup menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <ul class="menu-samping__daftar">
      <li class="menu-samping__item"><a href="/#bts-collection" class="menu-samping__tautan">BTS Collection</a></li>
      <li class="menu-samping__item"><a href="/#produk-unggulan" class="menu-samping__tautan">All Products</a></li>
      <li class="menu-samping__item"><a href="/#promo" class="menu-samping__tautan">All Day Promo</a></li>
      <li class="menu-samping__item"><a href="/kategori/backpack-collection" class="menu-samping__tautan">Backpacks</a></li>
      <li class="menu-samping__item"><a href="/kategori/slingbag-collection" class="menu-samping__tautan">Slingbags</a></li>
      <li class="menu-samping__item"><a href="/kategori/tumbler-collection" class="menu-samping__tautan">Tumbler Collection</a></li>
      <li class="menu-samping__item"><a href="/kategori/wallet-accessories" class="menu-samping__tautan">Wallet &amp; Accessories</a></li>
    </ul>
  </nav>

  <!-- Modals & Overlays -->
  <?php require_once PUBLIK_DIR . '/komponen/pencarian.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/preferensi.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/keranjang.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/cta-mengambang.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/modal-otentikasi.php'; ?>

  <!-- ========== KONTEN UTAMA: DETAIL PRODUK (PDP) ========== -->
  <main id="konten-utama" class="pdp">
    <!-- Breadcrumb -->
    <nav class="pdp__breadcrumb" aria-label="Breadcrumb">
      <ol class="pdp__breadcrumb-list">
        <li class="pdp__breadcrumb-item"><a href="/">Beranda</a></li>
        <li class="pdp__breadcrumb-separator">&rsaquo;</li>
        <li class="pdp__breadcrumb-item"><a href="/kategori/<?= htmlspecialchars($produk['slug_kategori'] ?? 'katalog') ?>"><?= htmlspecialchars($produk['nama_kategori'] ?? 'Katalog') ?></a></li>
        <li class="pdp__breadcrumb-separator">&rsaquo;</li>
        <li class="pdp__breadcrumb-item pdp__breadcrumb-item--aktif" aria-current="page"><?= htmlspecialchars($produk['nama']) ?></li>
      </ol>
    </nav>

    <!-- Grid 2-Kolom PDP -->
    <div class="pdp__grid">
      <!-- 1. Galeri Gambar (Kiri) -->
      <section class="pdp__galeri" aria-label="Galeri Foto Produk">
        <div class="pdp__gambar-utama-wadah" id="pdp-gambar-viewport" title="Klik untuk memperbesar gambar">
          <?php if ($apakahDiskon): ?>
            <span class="pdp__badge-diskon">10% OFF</span>
          <?php endif; ?>

          <img
            id="pdp-gambar-utama"
            src="<?= htmlspecialchars($gambarGaleri[0]['url'] ?? $produk['gambar_utama']) ?>"
            alt="<?= htmlspecialchars($produk['nama']) ?>"
            class="pdp__gambar-utama"
            loading="eager"
            fetchpriority="high"
          >

          <button type="button" class="pdp__tombol-zoom" id="pdp-tombol-zoom" aria-label="Perbesar foto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
        </div>

        <!-- Thumbnails Strip -->
        <?php if (!empty($gambarGaleri)): ?>
          <div class="pdp__thumbnails" role="tablist" aria-label="Thumbnail Gambar Produk">
            <?php foreach ($gambarGaleri as $idx => $gbr): ?>
              <button
                type="button"
                class="pdp__thumb-item <?= $idx === 0 ? 'aktif' : '' ?>"
                data-url="<?= htmlspecialchars($gbr['url']) ?>"
                role="tab"
                aria-label="Foto <?= $idx + 1 ?>"
              >
                <img src="<?= htmlspecialchars($gbr['url']) ?>" alt="<?= htmlspecialchars($gbr['alt_teks'] ?? $produk['nama']) ?>" loading="lazy">
              </button>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </section>

      <!-- 2. Informasi Produk, SKU & Tindakan (Kanan) -->
      <section class="pdp__info" aria-label="Informasi Produk">
        <div class="pdp__kategori-sku">
          <span><?= htmlspecialchars($produk['nama_kategori'] ?? 'Merchandise') ?></span>
          <span class="pdp__sku" id="pdp-sku">SKU: <?= htmlspecialchars($varianList[0]['sku'] ?? 'CRSL-ITEM') ?></span>
        </div>

        <h1 class="pdp__judul"><?= htmlspecialchars($produk['nama']) ?></h1>

        <div class="pdp__harga-box">
          <span class="pdp__harga-aktif" id="pdp-harga-aktif">Rp <?= number_format($hargaAktif, 0, ',', '.') ?></span>
          <?php if ($apakahDiskon): ?>
            <span class="pdp__harga-coret">Rp <?= number_format($produk['harga'], 0, ',', '.') ?></span>
          <?php endif; ?>
        </div>

        <!-- Pemilih Varian (Karakter / Warna) -->
        <?php if (!empty($varianList)): ?>
          <div class="pdp__opsi-grup">
            <div class="pdp__opsi-label">
              <span>Pilih Varian:</span>
              <span class="pdp__opsi-terpilih-nama" id="pdp-varian-terpilih"><?= htmlspecialchars($varianList[0]['nama_varian']) ?></span>
            </div>
            <div class="pdp__swatch-list">
              <?php foreach ($varianList as $idx => $v): ?>
                <button
                  type="button"
                  class="pdp__swatch-btn <?= $idx === 0 ? 'aktif' : '' ?>"
                  data-varian="<?= htmlspecialchars($v['nama_varian']) ?>"
                  data-sku="<?= htmlspecialchars($v['sku']) ?>"
                >
                  <span class="pdp__swatch-dot" style="background-color: <?= str_contains($v['nama_varian'], 'PINK') ? '#ec4899' : (str_contains($v['nama_varian'], 'BLUE') ? '#3b82f6' : (str_contains($v['nama_varian'], 'GREEN') ? '#10b981' : (str_contains($v['nama_varian'], 'BROWN') ? '#8b5a2b' : '#64748b'))) ?>;"></span>
                  <?= htmlspecialchars($v['nama_varian']) ?>
                </button>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endif; ?>

        <!-- Pemilih Ukuran -->
        <div class="pdp__opsi-grup">
          <div class="pdp__opsi-label">
            <span>Pilih Ukuran / Kapasitas:</span>
          </div>
          <div class="pdp__ukuran-list">
            <?php 
            $ukuranTersedia = array_unique(array_filter(array_column($varianList, 'atribut_ukuran')));
            if (empty($ukuranTersedia)) $ukuranTersedia = ['All Size'];
            foreach ($ukuranTersedia as $uIdx => $u):
            ?>
              <button
                type="button"
                class="pdp__ukuran-btn <?= $uIdx === 0 ? 'aktif' : '' ?>"
                data-ukuran="<?= htmlspecialchars($u) ?>"
              >
                <?= htmlspecialchars($u) ?>
              </button>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Kuantitas Stepper & Info Stok -->
        <div class="pdp__kuantitas-baris">
          <div class="pdp__stepper">
            <button type="button" class="pdp__stepper-btn" id="pdp-qty-minus" aria-label="Kurangi kuantitas">&minus;</button>
            <input type="number" id="pdp-qty-input" class="pdp__stepper-input" value="1" min="1" max="50" readonly aria-label="Jumlah item">
            <button type="button" class="pdp__stepper-btn" id="pdp-qty-plus" aria-label="Tambah kuantitas">&plus;</button>
          </div>
          <span class="pdp__stok-info" id="pdp-stok-info">Tersedia: <?= $varianList[0]['stok'] ?? 50 ?> item</span>
        </div>

        <!-- Tombol Aksi Desktop -->
        <div class="pdp__aksi-bar">
          <button type="button" class="pdp__btn-keranjang" id="pdp-btn-keranjang">
            + Masukkan Keranjang
          </button>
          <button type="button" class="pdp__btn-beli" id="pdp-btn-beli">
            Beli Sekarang
          </button>
        </div>

        <!-- Exclusive Accordion Component -->
        <div class="pdp__accordion" role="region" aria-label="Spesifikasi dan Kebijakan Produk">
          <!-- Accordion 1: Deskripsi & Fitur -->
          <div class="pdp__accordion-item aktif">
            <button type="button" class="pdp__accordion-header" aria-expanded="true">
              <span>Deskripsi &amp; Spesifikasi Produk</span>
              <svg class="pdp__accordion-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="pdp__accordion-konten">
              <p><?= htmlspecialchars($produk['deskripsi'] ?? 'Merchandise resmi CRSL dirancang dengan material berkualitas tinggi untuk kenyamanan dan durabilitas maksimal.') ?></p>
              <?php if (!empty($spesifikasiList)): ?>
                <table class="pdp__tabel-spesifikasi">
                  <tbody>
                    <?php foreach ($spesifikasiList as $spek): ?>
                      <tr>
                        <td><?= htmlspecialchars($spek['kunci']) ?></td>
                        <td><?= htmlspecialchars($spek['nilai']) ?></td>
                      </tr>
                    <?php endforeach; ?>
                  </tbody>
                </table>
              <?php endif; ?>
            </div>
          </div>

          <!-- Accordion 2: Panduan Ukuran (Size Chart) -->
          <div class="pdp__accordion-item">
            <button type="button" class="pdp__accordion-header" aria-expanded="false">
              <span>Panduan Ukuran (Size Chart)</span>
              <svg class="pdp__accordion-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="pdp__accordion-konten">
              <p>Pastikan ukuran yang Anda pilih sesuai dengan dimensi fisik:</p>
              <table class="pdp__tabel-spesifikasi">
                <thead>
                  <tr>
                    <th>Ukuran</th>
                    <th>Dimensi / Kapasitas</th>
                    <th>Rekomendasi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Standard</td>
                    <td>11.5 cm x 9.5 cm</td>
                    <td>Saku celana &amp; tas harian</td>
                  </tr>
                  <tr>
                    <td>Bottle 32oz</td>
                    <td>900 ml / 24 cm x 9 cm</td>
                    <td>Kebutuhan hidrasi seharian</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Accordion 3: Pengiriman & Kebijakan Garansi -->
          <div class="pdp__accordion-item">
            <button type="button" class="pdp__accordion-header" aria-expanded="false">
              <span>Pengiriman &amp; Kebijakan Garansi 7 Hari</span>
              <svg class="pdp__accordion-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="pdp__accordion-konten">
              <p><strong>Pengiriman Cepat &amp; Aman:</strong> Pesanan sebelum pukul 15.00 WIB dikirim pada hari yang sama. Estimasi tiba 2-4 hari kerja ke seluruh Indonesia.</p>
              <p style="margin-top: 8px;"><strong>Garansi Pengembalian 7 Hari:</strong> Jika produk yang Anda terima mengalami cacat jahitan, cacat cetak, atau kerusakan manufaktur, kami memberikan penggantian unit baru tanpa biaya tambahan.</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Lightbox Zoom Modal -->
    <div class="pdp__lightbox" id="pdp-lightbox" role="dialog" aria-modal="true" aria-label="Perbesar gambar produk">
      <button type="button" class="pdp__lightbox-tutup" id="pdp-lightbox-tutup" aria-label="Tutup pratinjau zoom">&times;</button>
      <img id="pdp-lightbox-img" src="" alt="Pratinjau Zoom Produk" class="pdp__lightbox-img">
    </div>
  </main>

  <!-- Sticky Bottom Action Bar Khusus Mobile -->
  <div class="pdp__mobile-bar" aria-label="Beli produk cepat">
    <div class="pdp__mobile-harga">
      <span class="pdp__mobile-harga-label">Total Harga:</span>
      <span class="pdp__mobile-harga-nilai" id="pdp-mobile-harga-nilai">Rp <?= number_format($hargaAktif, 0, ',', '.') ?></span>
    </div>
    <div class="pdp__mobile-btns">
      <button type="button" class="pdp__mobile-btn-cart" id="pdp-mobile-btn-cart">+ Keranjang</button>
      <button type="button" class="pdp__mobile-btn-buy" id="pdp-mobile-btn-buy">Beli Sekarang</button>
    </div>
  </div>

  <!-- Embedded JSON Data untuk JS Controller -->
  <script type="application/json" id="pdp-data-produk">
  <?= json_encode([
    'produk' => $produk,
    'varian' => $varianList,
    'spesifikasi' => $spesifikasiList
  ], JSON_HEX_TAG | JSON_HEX_AMP) ?>
  </script>

  <!-- JS Utilitas & Komponen -->
  <script src="/js/utilitas/i18n.js"></script>
  <script src="/js/komponen/bilah-atas.js"></script>
  <script src="/js/komponen/navigasi.js"></script>
  <script src="/js/komponen/menu-samping.js"></script>
  <script src="/js/komponen/pencarian.js"></script>
  <script src="/js/komponen/preferensi.js"></script>
  <script src="/js/komponen/keranjang.js"></script>
  <script src="/js/komponen/cta-mengambang.js"></script>
  <script src="/js/komponen/otentikasi.js"></script>
  <script src="/js/halaman/produk.js"></script>
  <script src="/js/aplikasi.js"></script>
</body>
</html>
