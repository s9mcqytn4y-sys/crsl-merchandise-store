<?php
/**
 * CRSL Merchandise Store - Halaman Detail Produk (PDP)
 * Standar /antislop-ui, /antislop-code, /baseline-ui, & /007
 * - Tata Letak 3 Kolom Desktop (Galeri Thumbnail, Foto Utama Zoom, Panel Informasi & Aksi)
 * - Animasi Transisi Kanan-ke-Kiri & Hardware-Accelerated Cursor Zoom
 * - Matriks SKU Dinamis, Coret Diagonal Ukuran Habis, Modal Kupon & T&C
 * - Estimator Ongkir Pengiriman & Tombol Chat WhatsApp
 * - Baris [You Might Also Like] & [Recent Viewed] Berbasis Algoritma
 */

$produkIdParam = $produkIdParam ?? null;
$slug = $produkSlug ?? 'crsl-cassie-wallet';

$produk = null;
$gambarGaleri = [];
$varianList = [];
$spesifikasiList = [];
$produkRekomendasi = [];
$semuaProdukLookup = [];

try {
  $dbFile = dirname(__DIR__, 2) . '/data/toko.db';
  if (file_exists($dbFile)) {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Kueri produk berdasarkan ID atau Slug
    if ($produkIdParam) {
      $stmt = $db->prepare("
        SELECT p.*, k.nama as nama_kategori, k.slug as slug_kategori
        FROM produk p
        LEFT JOIN kategori k ON p.kategori_id = k.id
        WHERE p.id = ? AND p.aktif = 1
      ");
      $stmt->execute([$produkIdParam]);
      $produk = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$produk) {
      $stmt = $db->prepare("
        SELECT p.*, k.nama as nama_kategori, k.slug as slug_kategori
        FROM produk p
        LEFT JOIN kategori k ON p.kategori_id = k.id
        WHERE (p.slug = ? OR p.slug LIKE ?) AND p.aktif = 1
      ");
      $stmt->execute([$slug, '%' . $slug . '%']);
      $produk = $stmt->fetch(PDO::FETCH_ASSOC);
    }

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

      // Kueri rekomendasi (You Might Also Like)
      $stmtRel = $db->prepare("
        SELECT p.*, k.nama as nama_kategori
        FROM produk p
        LEFT JOIN kategori k ON p.kategori_id = k.id
        WHERE p.id != ? AND p.aktif = 1
        ORDER BY (p.kategori_id = ?) DESC, p.id DESC
        LIMIT 6
      ");
      $stmtRel->execute([$produk['id'], $produk['kategori_id'] ?? 0]);
      $produkRekomendasi = $stmtRel->fetchAll(PDO::FETCH_ASSOC);
    }

    // Ambil daftar produk untuk pencarian dan Recent Viewed lookup
    $stmtAll = $db->query("
      SELECT id, nama, slug, harga, harga_diskon, gambar_utama, status_stok, tipe_produk
      FROM produk WHERE aktif = 1 LIMIT 20
    ");
    $semuaProdukLookup = $stmtAll->fetchAll(PDO::FETCH_ASSOC);
  }
} catch (Exception $e) {
  // Graceful fallback
}

// Fallback jika tidak ditemukan
if (!$produk) {
  $produk = [
    'id' => 907117,
    'nama' => 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid | Compact & Stylish',
    'slug' => 'crsl-cassie-wallet',
    'nama_kategori' => 'Wallet & Accessories',
    'slug_kategori' => 'wallet-accessories',
    'harga' => 199000,
    'harga_diskon' => 179100,
    'gambar_utama' => '/aset/gambar/cassie-wallet.webp',
    'deskripsi' => 'Dompet lipat kanvas kasual dengan sentuhan pola plaid yang unik dan stylish. Didesain ramping namun multifungsi untuk memuat kartu, uang kertas, dan koin Anda.',
    'tipe_produk' => 'regular',
    'status_stok' => 'in_stock'
  ];
  $gambarGaleri = [
    ['url' => '/aset/gambar/cassie-wallet.webp', 'alt_teks' => 'CRSL Cassie Wallet Depan'],
    ['url' => '/aset/gambar/banner-cassie.webp', 'alt_teks' => 'CRSL Cassie Wallet Detail Plaid'],
    ['url' => '/aset/gambar/banner-1.webp', 'alt_teks' => 'CRSL Cassie Wallet Lifestyle'],
    ['url' => '/aset/gambar/banner-2.webp', 'alt_teks' => 'CRSL Cassie Wallet Interior']
  ];
  $varianList = [
    ['sku' => 'CW-CHILO-PNK', 'nama_varian' => 'CHILO PINK', 'warna' => 'CHILO PINK', 'warna_hex' => '#F472B6', 'warna_gambar' => '/aset/gambar/cassie-wallet.webp', 'ukuran' => 'All Size', 'stok' => 24, 'harga_tambahan' => 0],
    ['sku' => 'CW-CHOCO-BRW', 'nama_varian' => 'CHOCO BROWN', 'warna' => 'CHOCO BROWN', 'warna_hex' => '#8B5A2B', 'warna_gambar' => '/aset/gambar/cassie-wallet.webp', 'ukuran' => 'All Size', 'stok' => 18, 'harga_tambahan' => 0]
  ];
}

if (empty($gambarGaleri) && !empty($produk['gambar_utama'])) {
  $gambarGaleri = [
    ['url' => $produk['gambar_utama'], 'alt_teks' => $produk['nama']],
    ['url' => '/aset/gambar/banner-1.webp', 'alt_teks' => 'Detail 1'],
    ['url' => '/aset/gambar/banner-2.webp', 'alt_teks' => 'Detail 2']
  ];
}

$hargaAktif = $produk['harga_diskon'] ?: $produk['harga'];
$apakahDiskon = $produk['harga_diskon'] && $produk['harga_diskon'] < $produk['harga'];
$persenDiskon = $apakahDiskon ? round((1 - ($produk['harga_diskon'] / $produk['harga'])) * 100) : 0;

$badgeStatus = 'In Stock';
if (($produk['tipe_produk'] ?? '') === 'pre_order') {
  $badgeStatus = 'Pre Order';
} elseif (($produk['status_stok'] ?? '') === 'low_stock') {
  $badgeStatus = 'Low Stock';
} elseif (($produk['status_stok'] ?? '') === 'sold_out') {
  $badgeStatus = 'Sold out';
}
?>
<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($produk['nama']) ?> - CRSL Official Store</title>
  <meta name="description" content="<?= htmlspecialchars(substr($produk['deskripsi'] ?? $produk['nama'], 0, 160)) ?>">

  <!-- Open Graph & SEO -->
  <meta property="og:title" content="<?= htmlspecialchars($produk['nama']) ?>">
  <meta property="og:description" content="<?= htmlspecialchars(substr($produk['deskripsi'] ?? $produk['nama'], 0, 160)) ?>">
  <meta property="og:type" content="product">
  <meta property="og:image" content="<?= htmlspecialchars($produk['gambar_utama']) ?>">
  <meta property="og:url" content="<?= APP_URL ?>/products/<?= $produk['id'] ?>/<?= htmlspecialchars($produk['slug']) ?>">

  <!-- Stylesheets -->
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
      "url": "<?= APP_URL ?>/products/<?= $produk['id'] ?>/<?= htmlspecialchars($produk['slug']) ?>",
      "priceCurrency": "IDR",
      "price": "<?= $hargaAktif ?>",
      "availability": "https://schema.org/<?= ($produk['status_stok'] === 'sold_out') ? 'OutOfStock' : 'InStock' ?>"
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
      <li class="menu-samping__item"><a href="/bundles/3516/back-to-school-with-miflo" class="menu-samping__tautan">BTS Collection</a></li>
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

  <!-- ========== KONTEN UTAMA: DETAIL PRODUK (PDP 3-KOLOM) ========== -->
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

    <!-- Grid Anatomi 3-Kolom PDP -->
    <div class="pdp__grid-tiga-kolom">
      
      <!-- KOLOM 1: Galeri Thumbnail Vertikal -->
      <aside class="pdp__kolom-thumbnail" aria-label="Daftar Foto Produk">
        <div class="pdp__thumbnail-vertikal" role="tablist">
          <?php foreach ($gambarGaleri as $idx => $gbr): ?>
            <button
              type="button"
              class="pdp__thumb-btn <?= $idx === 0 ? 'aktif' : '' ?>"
              data-index="<?= $idx ?>"
              data-url="<?= htmlspecialchars($gbr['url']) ?>"
              role="tab"
              aria-selected="<?= $idx === 0 ? 'true' : 'false' ?>"
              aria-label="Foto produk <?= $idx + 1 ?>"
            >
              <img src="<?= htmlspecialchars($gbr['url']) ?>" alt="<?= htmlspecialchars($gbr['alt_teks'] ?? $produk['nama']) ?>" loading="lazy" width="70" height="70">
            </button>
          <?php endforeach; ?>
        </div>
      </aside>

      <!-- KOLOM 2: Foto Utama Interaktif dengan Zoom Kursor & Animasi Kanan-ke-Kiri -->
      <section class="pdp__kolom-utama" aria-label="Tampilan Gambar Produk">
        <div class="pdp__viewport-zoom" id="pdp-zoom-viewport" title="Arahkan kursor untuk memperbesar gambar">
          <!-- Badges Overlay pada Gambar -->
          <div class="pdp__gambar-badges">
            <?php if (($produk['tipe_produk'] ?? '') === 'pre_order'): ?>
              <span class="pdp__badge-tipe pdp__badge-tipe--po">Pre Order</span>
              <span class="pdp__badge-kategori">Tumbler Collection</span>
            <?php endif; ?>
            <?php if ($apakahDiskon): ?>
              <span class="pdp__badge-diskon"><?= $persenDiskon ?>% OFF</span>
            <?php endif; ?>
          </div>

          <!-- Gambar Utama -->
          <img
            id="pdp-gambar-fokus"
            src="<?= htmlspecialchars($gambarGaleri[0]['url'] ?? $produk['gambar_utama']) ?>"
            alt="<?= htmlspecialchars($produk['nama']) ?>"
            class="pdp__gambar-fokus"
            loading="eager"
            fetchpriority="high"
          >

          <!-- Tombol Fullscreen Zoom / Lightbox -->
          <button type="button" class="pdp__tombol-expand" id="pdp-btn-expand" aria-label="Buka zoom layar penuh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- KOLOM 3: Anatomi Informasi & Aksi Pembelian -->
      <section class="pdp__kolom-aksi" aria-label="Informasi dan Pembelian">
        
        <!-- Section 1: Badge Kondisi / Status -->
        <div class="pdp__sec-status">
          <span class="pdp__badge-status <?= strtolower(str_replace(' ', '-', $badgeStatus)) ?>" id="pdp-status-badge">
            <?= htmlspecialchars($badgeStatus) ?>
          </span>
          <?php if (!empty($produk['estimasi_po'])): ?>
            <span class="pdp__badge-estimasi"><?= htmlspecialchars($produk['estimasi_po']) ?></span>
          <?php endif; ?>
        </div>

        <!-- Section 2: Judul Produk dengan Pattern "|" -->
        <h1 class="pdp__sec-judul" id="pdp-judul-produk">
          <?= htmlspecialchars($produk['nama']) ?>
        </h1>

        <!-- Section 3: Pricing Dinamis Berdasarkan Diskon -->
        <div class="pdp__sec-harga">
          <?php if ($apakahDiskon): ?>
            <div class="pdp__harga-baris-coret">
              <span class="pdp__harga-asli">Rp <?= number_format($produk['harga'], 0, ',', '.') ?></span>
            </div>
            <div class="pdp__harga-baris-utama">
              <span class="pdp__harga-nominal" id="pdp-harga-nominal">Rp <?= number_format($produk['harga_diskon'], 0, ',', '.') ?></span>
              <span class="pdp__persen-diskon"><?= $persenDiskon ?>%</span>
            </div>
          <?php else: ?>
            <div class="pdp__harga-baris-utama">
              <span class="pdp__harga-nominal" id="pdp-harga-nominal">Rp <?= number_format($produk['harga'], 0, ',', '.') ?></span>
            </div>
          <?php endif; ?>
        </div>

        <!-- Section 4: Komponen Kupon Diskon Aktif (Klik Membuka Modal Pop-up) -->
        <div class="pdp__sec-kupon" id="pdp-buka-kupon" role="button" tabindex="0" aria-label="Buka daftar kupon dan diskon">
          <div class="pdp__kupon-ikon-kotak" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
              <line x1="12" y1="9" x2="12" y2="15"/>
            </svg>
          </div>
          <div class="pdp__kupon-teks-box">
            <div class="pdp__kupon-teks-utama">You have 1 Discount available</div>
            <div class="pdp__kupon-teks-sub">Use a coupon now for even better deals!</div>
          </div>
          <div class="pdp__kupon-panah" aria-hidden="true">&rsaquo;</div>
        </div>

        <!-- Section 5: Pemilih Warna (Berdasarkan Image Box atau Dot Warna) -->
        <div class="pdp__sec-warna">
          <div class="pdp__label-baris">
            <span class="pdp__label-judul">Color</span>
            <span class="pdp__label-pilihan" id="pdp-warna-terpilih-nama"><?= htmlspecialchars($varianList[0]['warna'] ?? 'Default') ?></span>
          </div>
          <div class="pdp__swatch-container" id="pdp-swatch-container" role="radiogroup" aria-label="Pilih Warna">
            <?php foreach ($varianList as $vIdx => $var): ?>
              <?php 
                $apakahHabis = ($var['stok'] ?? 1) <= 0;
                $warnaGambar = $var['warna_gambar'] ?? $produk['gambar_utama'];
                $warnaHex = $var['warna_hex'] ?? '#64748b';
              ?>
              <button
                type="button"
                class="pdp__swatch-box <?= $vIdx === 0 ? 'aktif' : '' ?> <?= $apakahHabis ? 'habis' : '' ?>"
                data-sku="<?= htmlspecialchars($var['sku']) ?>"
                data-warna="<?= htmlspecialchars($var['warna'] ?? $var['nama_varian']) ?>"
                data-stok="<?= (int)$var['stok'] ?>"
                data-ukuran="<?= htmlspecialchars($var['ukuran'] ?? 'All Size') ?>"
                data-gambar="<?= htmlspecialchars($warnaGambar) ?>"
                <?= $apakahHabis ? 'aria-disabled="true"' : '' ?>
                role="radio"
                aria-checked="<?= $vIdx === 0 ? 'true' : 'false' ?>"
              >
                <?php if (!empty($warnaGambar) && file_exists(ROOT_DIR . $warnaGambar)): ?>
                  <div class="pdp__swatch-img-wadah">
                    <img src="<?= htmlspecialchars($warnaGambar) ?>" alt="<?= htmlspecialchars($var['warna'] ?? $var['nama_varian']) ?>" loading="lazy" width="46" height="46">
                  </div>
                <?php else: ?>
                  <span class="pdp__swatch-dot" style="background-color: <?= htmlspecialchars($warnaHex) ?>;"></span>
                <?php endif; ?>
                <span class="pdp__swatch-label"><?= htmlspecialchars($var['warna'] ?? $var['nama_varian']) ?></span>
              </button>
            <?php endforeach; ?>
          </div>
          <div class="pdp__swatch-pesan-error" id="pdp-warna-error" role="alert" style="display:none;">
            Silakan pilih salah satu varian warna terlebih dahulu.
          </div>
        </div>

        <!-- Section 6: Pemilih Ukuran dengan Strikethrough Diagonal jika Kosong -->
        <div class="pdp__sec-ukuran">
          <div class="pdp__label-baris">
            <span class="pdp__label-judul">Size</span>
            <span class="pdp__label-pilihan" id="pdp-ukuran-terpilih-nama"></span>
          </div>
          <div class="pdp__ukuran-container" id="pdp-ukuran-container" role="radiogroup" aria-label="Pilih Ukuran">
            <?php
              $daftarUkuranUnik = [];
              foreach ($varianList as $v) {
                $u = $v['ukuran'] ?? $v['atribut_ukuran'] ?? 'All Size';
                if (!isset($daftarUkuranUnik[$u])) {
                  $daftarUkuranUnik[$u] = (int)$v['stok'];
                } else {
                  $daftarUkuranUnik[$u] += (int)$v['stok'];
                }
              }
              if (empty($daftarUkuranUnik)) {
                $daftarUkuranUnik = ['All Size' => 50];
              }

              $pertamaTersedia = null;
              foreach ($daftarUkuranUnik as $uNama => $uStok) {
                if ($uStok > 0 && $pertamaTersedia === null) {
                  $pertamaTersedia = $uNama;
                }
              }
              if ($pertamaTersedia === null) {
                $pertamaTersedia = array_key_first($daftarUkuranUnik);
              }

              foreach ($daftarUkuranUnik as $uNama => $uStok):
                $isKosong = ($uStok <= 0);
                $isTerpilih = ($uNama === $pertamaTersedia && !$isKosong);
            ?>
              <button
                type="button"
                class="pdp__ukuran-kotak <?= $isTerpilih ? 'aktif' : '' ?> <?= $isKosong ? 'habis' : '' ?>"
                data-ukuran="<?= htmlspecialchars($uNama) ?>"
                data-stok="<?= $uStok ?>"
                <?= $isKosong ? 'disabled aria-disabled="true"' : '' ?>
                role="radio"
                aria-checked="<?= $isTerpilih ? 'true' : 'false' ?>"
                title="<?= $isKosong ? 'Ukuran ' . htmlspecialchars($uNama) . ' sedang habis' : 'Pilih ukuran ' . htmlspecialchars($uNama) ?>"
              >
                <?= htmlspecialchars($uNama) ?>
              </button>
            <?php endforeach; ?>
          </div>
          <!-- Notifikasi Restock saat Stok Habis -->
          <div class="pdp__restock-notif" id="pdp-restock-notif" style="display: none;">
            <span>Stok untuk kombinasi ini sedang kosong.</span>
            <button type="button" class="pdp__btn-ingatkan" id="pdp-btn-ingatkan">Ingatkan Saya Saat Restock</button>
          </div>
        </div>

        <!-- Section 7: Stepper Input Kuantitas -->
        <div class="pdp__sec-stepper">
          <div class="pdp__stepper-wrap">
            <button type="button" class="pdp__step-btn" id="pdp-step-minus" aria-label="Kurangi kuantitas">&minus;</button>
            <input type="number" id="pdp-step-input" class="pdp__step-angka" value="1" min="1" max="50" readonly aria-label="Jumlah yang dibeli">
            <button type="button" class="pdp__step-btn" id="pdp-step-plus" aria-label="Tambah kuantitas">&plus;</button>
          </div>
          <span class="pdp__stok-keterangan" id="pdp-stok-keterangan"></span>
        </div>

        <!-- Section 8: Tombol Aksi Pembelian -->
        <div class="pdp__sec-aksi">
          <button type="button" class="pdp__btn-add-cart" id="pdp-btn-add-cart">
            Add to Cart
          </button>
          <button type="button" class="pdp__btn-buy-now" id="pdp-btn-buy-now">
            Buy It Now
          </button>
        </div>

        <!-- Section 9: Deskripsi Produk dengan UX "View more / View less" -->
        <div class="pdp__sec-deskripsi">
          <h2 class="pdp__desc-judul">Tentang Produk</h2>
          <div class="pdp__desc-konten ciut" id="pdp-desc-konten">
            <p><?= nl2br(htmlspecialchars($produk['deskripsi'] ?? 'Merchandise resmi CRSL dengan sentuhan karakter orisinal berkualitas premium.')) ?></p>
            <?php if (!empty($spesifikasiList)): ?>
              <table class="pdp__tabel-spesifikasi">
                <tbody>
                  <?php foreach ($spesifikasiList as $spek): ?>
                    <tr>
                      <th><?= htmlspecialchars($spek['kunci']) ?></th>
                      <td><?= htmlspecialchars($spek['nilai']) ?></td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
              </table>
            <?php endif; ?>
          </div>
          <button type="button" class="pdp__btn-view-more" id="pdp-btn-view-more" aria-expanded="false">
            <span>View more</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        <!-- Section 10: Kontainer Delivery (Gambar 1 & Gambar 5) -->
        <div class="pdp__sec-delivery" id="pdp-sec-delivery">
          <h2 class="pdp__delivery-card-title" data-i18n="pdp.delivery_title">Delivery</h2>
          <div class="pdp__delivery-table">
            <!-- Row 1: Deliver to -->
            <div class="pdp__delivery-row">
              <span class="pdp__delivery-label" data-i18n="pdp.deliver_to">Deliver to:</span>
              <button type="button" class="pdp__delivery-btn-lokasi" id="pdp-btn-pilih-alamat" aria-haspopup="dialog" aria-expanded="false" aria-controls="pdp-modal-alamat">
                <span id="pdp-teks-alamat-tujuan" class="pdp__teks-tujuan">Pilih Alamat Pengiriman</span>
                <svg class="pdp__chevron-lokasi" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>

            <!-- Row 2: Estimated Delivery Cost -->
            <div class="pdp__delivery-row pdp__delivery-row--cost">
              <span class="pdp__delivery-label" data-i18n="pdp.est_delivery_cost">Estimated Delivery Cost:</span>
              <div class="pdp__delivery-cost-wrap">
                <button type="button" class="pdp__delivery-btn-cost" id="pdp-btn-cek-ongkir" aria-haspopup="dialog" aria-expanded="false" aria-controls="pdp-popover-kurir">
                  <span id="pdp-teks-ongkir" class="pdp__teks-ongkir">Check Delivery Cost</span>
                  <span id="pdp-ikon-ongkir-info" class="pdp__ikon-info" style="display:none;" aria-label="Rincian opsi kurir">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </span>
                </button>

                <!-- Floating Popover Opsi Kurir (2 Kolom: Logo & Tarif+Layanan) -->
                <div class="pdp__popover-kurir" id="pdp-popover-kurir" role="dialog" aria-modal="false" aria-label="Rincian opsi kurir" style="display:none;">
                  <div class="pdp__popover-kurir-header">
                    <span class="pdp__popover-kurir-judul" data-i18n="pdp.courier_options">Opsi Kurir Pengiriman</span>
                    <button type="button" class="pdp__popover-kurir-tutup" id="pdp-btn-tutup-kurir" aria-label="Tutup popover">&times;</button>
                  </div>
                  <div class="pdp__popover-kurir-list" id="pdp-kurir-list">
                    <!-- Dinamis terisi dari JS: Kolom 1 Logo kurir, Kolom 2: Baris 1 Nominal ongkir, Baris 2 Opsi layanan & estimasi -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 3: Weight -->
            <div class="pdp__delivery-row">
              <span class="pdp__delivery-label" data-i18n="pdp.weight">Weight:</span>
              <span class="pdp__delivery-weight-val" id="pdp-berat-produk"><?= (int)($produk['berat'] ?: 500) ?>g</span>
            </div>
          </div>

          <!-- Footnote Catatan Pengiriman -->
          <div class="pdp__delivery-footnote">
            <p data-i18n="pdp.shipped_within">Shipped within 24 hours,</p>
            <p data-i18n="pdp.payment_confirmation">(Upon confirmation of payment)</p>
          </div>
        </div>

        <!-- Section 11: Tombol Chat WhatsApp "Message CRSL" -->
        <div class="pdp__sec-whatsapp">
          <a
            href="https://wa.me/6281234567890?text=Halo%20CRSL,%20saya%20tertarik%20dengan%20produk%20<?= urlencode($produk['nama']) ?>"
            target="_blank"
            rel="noopener noreferrer"
            class="pdp__btn-whatsapp"
            aria-label="Kirim pesan ke CRSL via WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/>
            </svg>
            <span>Message CRSL</span>
          </a>
        </div>

      </section>

    </div>

    <!-- ========== ROW SECTION 1: YOU MIGHT ALSO LIKE ========== -->
    <section class="pdp__rekomendasi" aria-labelledby="judul-rekomendasi">
      <div class="pdp__rekomendasi-header">
        <h2 id="judul-rekomendasi" class="pdp__rekomendasi-judul">You Might Also Like</h2>
        <div class="pdp__carousel-nav">
          <button type="button" class="pdp__nav-btn pdp__nav-btn--prev" id="pdp-rekomendasi-prev" aria-label="Geser rekomendasi ke kiri">&lsaquo;</button>
          <button type="button" class="pdp__nav-btn pdp__nav-btn--next" id="pdp-rekomendasi-next" aria-label="Geser rekomendasi ke kanan">&rsaquo;</button>
        </div>
      </div>
      <div class="pdp__carousel-track" id="pdp-rekomendasi-track">
        <?php foreach ($produkRekomendasi as $pRek): ?>
          <?php 
            $pHarga = $pRek['harga_diskon'] ?: $pRek['harga'];
            $pDiskon = $pRek['harga_diskon'] && $pRek['harga_diskon'] < $pRek['harga'];
          ?>
          <article class="pdp__card-katalog">
            <a href="/products/<?= $pRek['id'] ?>/<?= htmlspecialchars($pRek['slug']) ?>" class="pdp__card-media">
              <img src="<?= htmlspecialchars($pRek['gambar_utama']) ?>" alt="<?= htmlspecialchars($pRek['nama']) ?>" loading="lazy" width="220" height="220">
              <?php if ($pDiskon): ?>
                <span class="pdp__card-badge-diskon"><?= round((1 - $pRek['harga_diskon'] / $pRek['harga']) * 100) ?>% OFF</span>
              <?php endif; ?>
            </a>
            <div class="pdp__card-info">
              <span class="pdp__card-kategori"><?= htmlspecialchars($pRek['nama_kategori'] ?? 'Merchandise') ?></span>
              <h3 class="pdp__card-nama">
                <a href="/products/<?= $pRek['id'] ?>/<?= htmlspecialchars($pRek['slug']) ?>"><?= htmlspecialchars($pRek['nama']) ?></a>
              </h3>
              <div class="pdp__card-harga">
                <span class="pdp__card-harga-aktif">Rp <?= number_format($pHarga, 0, ',', '.') ?></span>
                <?php if ($pDiskon): ?>
                  <span class="pdp__card-harga-coret">Rp <?= number_format($pRek['harga'], 0, ',', '.') ?></span>
                <?php endif; ?>
              </div>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- ========== ROW SECTION 2: RECENT VIEWED ========== -->
    <section class="pdp__recent-viewed" id="pdp-recent-section" aria-labelledby="judul-recent" style="display:none;">
      <div class="pdp__rekomendasi-header">
        <h2 id="judul-recent" class="pdp__rekomendasi-judul">Recently Viewed</h2>
        <div class="pdp__carousel-nav">
          <button type="button" class="pdp__nav-btn pdp__nav-btn--prev" id="pdp-recent-prev" aria-label="Geser riwayat ke kiri">&lsaquo;</button>
          <button type="button" class="pdp__nav-btn pdp__nav-btn--next" id="pdp-recent-next" aria-label="Geser riwayat ke kanan">&rsaquo;</button>
        </div>
      </div>
      <div class="pdp__carousel-track" id="pdp-recent-track">
        <!-- Diisi secara dinamis oleh JavaScript berdasarkan riwayat kunjungan -->
      </div>
    </section>

    <!-- ========== MODAL POP-UP DISCOUNTS & T&C (Gambar 5) ========== -->
    <div class="pdp__modal-overlay" id="pdp-modal-diskon-overlay" aria-hidden="true">
      <div class="pdp__modal-diskon" role="dialog" aria-modal="true" aria-labelledby="modal-diskon-judul">
        <div class="pdp__modal-header">
          <h3 id="modal-diskon-judul" class="pdp__modal-judul">DISCOUNTS</h3>
          <button type="button" class="pdp__modal-tutup" id="pdp-btn-tutup-diskon" aria-label="Tutup modal diskon">&times;</button>
        </div>
        <div class="pdp__modal-body">
          <div class="pdp__voucher-tiket">
            <div class="pdp__voucher-kiri">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div class="pdp__voucher-kanan">
              <div class="pdp__voucher-judul">Shipping: Rp 10,000 off</div>
              
              <!-- Accordion T&C -->
              <div class="pdp__tc-wrap">
                <button type="button" class="pdp__tc-btn" id="pdp-btn-tc-toggle" aria-expanded="false">
                  <span>T&amp;C</span>
                  <svg class="pdp__tc-ikon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="pdp__tc-isi" id="pdp-tc-isi">
                  <ul>
                    <li>Min. order Rp 179,000</li>
                    <li>Limited couriers (JNE, SiCepat, J&amp;T)</li>
                    <li>Maksimal 1 kali penggunaan per akun terdaftar</li>
                    <li>Tidak dapat digabungkan dengan promo paket bundle</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <button type="button" class="pdp__btn-klaim-kupon" id="pdp-btn-klaim-kupon">
            Gunakan Kupon Ini
          </button>
        </div>
      </div>
    </div>

    <!-- Lightbox Zoom Fullscreen Modal -->
    <div class="pdp__lightbox" id="pdp-lightbox" role="dialog" aria-modal="true" aria-label="Perbesar gambar produk">
      <button type="button" class="pdp__lightbox-tutup" id="pdp-lightbox-tutup" aria-label="Tutup pratinjau zoom">&times;</button>
      <img id="pdp-lightbox-img" src="" alt="Pratinjau Zoom Produk" class="pdp__lightbox-img">
    </div>

    <!-- ========== MODAL POP-UP PEMILIHAN ALAMAT BERTINGKAT (Gambar 2, 3, 4) ========== -->
    <div class="pdp__modal-alamat-overlay" id="pdp-modal-alamat-overlay" aria-hidden="true">
      <div class="pdp__modal-alamat" id="pdp-modal-alamat" role="dialog" aria-modal="true" aria-labelledby="pdp-modal-alamat-step-title">
        
        <!-- Header: Tombol Back & Judul Langkah -->
        <div class="pdp__modal-alamat-header">
          <button type="button" class="pdp__modal-alamat-btn-back" id="pdp-alamat-btn-back" aria-label="Kembali ke langkah sebelumnya">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h3 id="pdp-modal-alamat-step-title" class="pdp__modal-alamat-title">1. Pick Province</h3>
          <button type="button" class="pdp__modal-alamat-btn-close" id="pdp-alamat-btn-close" aria-label="Tutup modal">&times;</button>
        </div>

        <!-- Subtitle Context Dinamis -->
        <p class="pdp__modal-alamat-subtitle" id="pdp-alamat-subtitle">Send package to which address?</p>

        <!-- Search Input with Search Icon on Right -->
        <div class="pdp__modal-alamat-search-wrap">
          <input type="text" id="pdp-alamat-search-input" class="pdp__modal-alamat-search" placeholder="Search Province" aria-label="Cari wilayah">
          <div class="pdp__modal-alamat-search-ikon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        <!-- List Items Container -->
        <div class="pdp__modal-alamat-list" id="pdp-alamat-list-items" role="listbox">
          <!-- Diisi via JS: Item list dengan chevron > -->
        </div>

      </div>
    </div>

  </main>

  <!-- Sticky Bottom Action Bar Khusus Mobile -->
  <div class="pdp__mobile-bar" aria-label="Beli produk cepat">
    <div class="pdp__mobile-harga">
      <span class="pdp__mobile-harga-label">Total Harga:</span>
      <span class="pdp__mobile-harga-nilai" id="pdp-mobile-harga-nilai">Rp <?= number_format($hargaAktif, 0, ',', '.') ?></span>
    </div>
    <div class="pdp__mobile-btns">
      <button type="button" class="pdp__mobile-btn-cart" id="pdp-mobile-btn-cart">Add to Cart</button>
      <button type="button" class="pdp__mobile-btn-buy" id="pdp-mobile-btn-buy">Buy It Now</button>
    </div>
  </div>

  <!-- Embedded JSON Data untuk JS Controller -->
  <script type="application/json" id="pdp-data-produk">
  <?= json_encode([
    'produk' => $produk,
    'varian' => $varianList,
    'spesifikasi' => $spesifikasiList,
    'semuaProduk' => $semuaProdukLookup
  ], JSON_HEX_TAG | JSON_HEX_AMP) ?>
  </script>

  <!-- Script JS -->
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
