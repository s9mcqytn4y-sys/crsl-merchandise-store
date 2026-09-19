<?php
/**
 * CRSL Merchandise Store - Halaman Katalog Semua Produk (/products)
 * Standar /antislop-ui, /antislop-layoutmobile, /baseline-ui, /007
 */

use CRSL\BasisData\PengelolaDatabase;

$slugKategoriAktif = $_GET['kategori'] ?? ($kategoriSlugParam ?? 'all-products');
$sortAktif = $_GET['sort'] ?? 'terbaru';
$searchQuery = trim($_GET['q'] ?? '');

$daftarKategori = [];
$daftarProduk = [];

try {
    $db = PengelolaDatabase::dapatkanKoneksi();

    // 1. Ambil semua kategori aktif
    $stmtKat = $db->query("SELECT id, nama, slug FROM kategori ORDER BY id ASC");
    $daftarKategori = $stmtKat->fetchAll(PDO::FETCH_ASSOC);

    // 2. Ambil semua produk dengan nama kategorinya
    $sql = "
        SELECT p.*, k.nama as nama_kategori, k.slug as slug_kategori
        FROM produk p
        LEFT JOIN kategori k ON p.kategori_id = k.id
        WHERE p.aktif = 1
        ORDER BY p.id DESC
    ";
    $stmtProd = $db->query($sql);
    $daftarProduk = $stmtProd->fetchAll(PDO::FETCH_ASSOC);

} catch (\Exception $e) {
    $daftarKategori = [];
    $daftarProduk = [];
}
?>
<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>All Products - CRSL Official Store</title>
  <meta name="description" content="Jelajahi seluruh katalog merchandise resmi CRSL. Pakaian, tas ransel, selempang, tumbler, topi, dan aksesoris orisinal karakter CRSL.">

  <!-- Open Graph -->
  <meta property="og:title" content="All Products - CRSL Official Store">
  <meta property="og:description" content="Katalog merchandise resmi karakter orisinal CRSL.">
  <meta property="og:type" content="website">

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
  <link rel="stylesheet" href="/css/halaman/katalog.css">
</head>
<body>
  <!-- Skip Navigation -->
  <a href="#konten-utama" class="lewati-navigasi">Lewati ke konten utama</a>

  <!-- Bilah Atas -->
  <div class="bilah-atas" role="region" aria-label="Pengumuman promo">
    <div class="bilah-atas__rotator"></div>
  </div>

  <!-- Header Navigasi -->
  <header class="navigasi" role="banner">
    <div class="navigasi__wadah">
      <div class="navigasi__kiri">
        <button type="button" id="tombol-menu" class="navigasi__tombol-ikon" aria-label="Buka menu navigasi" aria-expanded="false">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
      <div class="navigasi__tengah">
        <a href="/" class="navigasi__logo-link" aria-label="CRSL Official Store">
          <img src="/aset/gambar/logo-crsl.png" alt="CRSL Official" width="100" height="28" class="navigasi__logo-gambar">
        </a>
      </div>
      <div class="navigasi__kanan">
        <button type="button" id="tombol-tema" class="navigasi__tombol-ikon" aria-label="Ganti tema">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button type="button" id="tombol-preferensi" class="navigasi__tombol-ikon" aria-label="Pengaturan negara dan bahasa">
          <span class="navigasi__bendera">
            <svg width="18" height="12" viewBox="0 0 900 600" aria-hidden="true" style="border-radius: 2px; display: block;">
              <rect width="900" height="300" fill="#e70011"/>
              <rect y="300" width="900" height="300" fill="#ffffff"/>
            </svg>
          </span>
          <span class="navigasi__mata-uang-label">IDR</span>
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

  <!-- Shell Modals -->
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
      <li class="menu-samping__item"><a href="/products" class="menu-samping__tautan menu-samping__tautan--aktif">All Products <span class="menu-samping__emoji">🛍️</span></a></li>
      <li class="menu-samping__item"><a href="/#bundles" class="menu-samping__tautan">BTS Must-Have Bundle <span class="menu-samping__emoji">🎒</span></a></li>
      <li class="menu-samping__item"><a href="/#pre-order" class="menu-samping__tautan menu-samping__tautan--promo">Pre-Order Now <span class="menu-samping__emoji">🔥</span></a></li>
      <li class="menu-samping__item"><a href="/#karakter-crsl" class="menu-samping__tautan">Karakter CRSL <span class="menu-samping__emoji">🐾</span></a></li>
      <li class="menu-samping__item"><a href="/#produk-unggulan" class="menu-samping__tautan">Katalog Populer <span class="menu-samping__emoji">✨</span></a></li>
    </ul>
  </nav>

  <?php require_once PUBLIK_DIR . '/komponen/pencarian.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/preferensi.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/keranjang.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/cta-mengambang.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/modal-otentikasi.php'; ?>

  <!-- ========== KONTEN UTAMA: KATALOG ALL PRODUCTS ========== -->
  <main class="katalog-page" id="konten-utama">
    <div class="katalog-container">

      <!-- Breadcrumb Navigation -->
      <nav class="katalog-breadcrumb" aria-label="Jejak navigasi">
        <ol class="katalog-breadcrumb__list">
          <li class="katalog-breadcrumb__item"><a href="/">Home</a></li>
          <li class="katalog-breadcrumb__pemisah" aria-hidden="true">/</li>
          <li class="katalog-breadcrumb__item active" aria-current="page">All Products</li>
        </ol>
      </nav>

      <!-- Header Banner Katalog -->
      <header class="katalog-header">
        <div class="katalog-header__info">
          <h1 class="katalog-header__judul">All Products</h1>
          <p class="katalog-header__subjudul">
            Temukan <span id="katalog-total-produk"><?= count($daftarProduk) ?></span> pilihan produk merchandise resmi CRSL dengan karakter autentik favoritmu.
          </p>
        </div>

        <!-- Tombol Aksi Filter & Sort -->
        <div class="katalog-header__actions">
          <button type="button" class="katalog-btn-filter" id="btn-buka-filter-drawer" aria-haspopup="dialog" aria-expanded="false" aria-controls="katalog-filter-drawer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            <span>Filter &amp; Sort</span>
            <span class="katalog-filter-badge" id="katalog-filter-badge" style="display:none;">0</span>
          </button>
        </div>
      </header>

      <!-- Kategori Bar Horizontal (Scrollable Pill Selector) -->
      <div class="katalog-kategori-bar" role="tablist" aria-label="Filter Kategori">
        <button
          type="button"
          class="katalog-kategori-pill <?= ($slugKategoriAktif === 'all-products' || empty($slugKategoriAktif)) ? 'aktif' : '' ?>"
          data-kategori="all-products"
          role="tab"
          aria-selected="<?= ($slugKategoriAktif === 'all-products' || empty($slugKategoriAktif)) ? 'true' : 'false' ?>"
        >
          All Products
        </button>

        <?php foreach ($daftarKategori as $kat): ?>
          <?php if ($kat['slug'] === 'all-products') continue; ?>
          <button
            type="button"
            class="katalog-kategori-pill <?= ($slugKategoriAktif === $kat['slug']) ? 'aktif' : '' ?>"
            data-kategori="<?= htmlspecialchars($kat['slug']) ?>"
            role="tab"
            aria-selected="<?= ($slugKategoriAktif === $kat['slug']) ? 'true' : 'false' ?>"
          >
            <?= htmlspecialchars($kat['nama']) ?>
          </button>
        <?php endforeach; ?>
      </div>

      <!-- Toolbar Quick Info & Search input -->
      <div class="katalog-toolbar">
        <div class="katalog-search-box">
          <svg class="katalog-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="katalog-search-input" class="katalog-search-input" placeholder="Cari nama merchandise..." value="<?= htmlspecialchars($searchQuery) ?>" aria-label="Cari produk di katalog">
          <button type="button" id="katalog-search-clear" class="katalog-search-clear" style="display:none;" aria-label="Hapus kata kunci">&times;</button>
        </div>

        <div class="katalog-sort-desktop">
          <label for="katalog-select-sort" class="katalog-sort-label">Urutkan:</label>
          <select id="katalog-select-sort" class="katalog-sort-select" aria-label="Pilih urutan produk">
            <option value="terbaru">Terbaru</option>
            <option value="harga_asc">Harga: Terendah &rarr; Tertinggi</option>
            <option value="harga_desc">Harga: Tertinggi &rarr; Terendah</option>
            <option value="diskon_desc">Diskon Terbesar</option>
            <option value="nama_asc">Nama A &rarr; Z</option>
          </select>
        </div>
      </div>

      <!-- Grid Produk Katalog -->
      <div class="katalog-grid" id="katalog-grid-produk" aria-live="polite">
        <!-- Dinamis di-render dan di-lazy-load oleh katalog.js -->
      </div>

      <!-- State Kosong jika tidak ada produk -->
      <div class="katalog-empty" id="katalog-empty-state" style="display: none;">
        <div class="katalog-empty__icon">🔍</div>
        <h3 class="katalog-empty__title">Produk tidak ditemukan</h3>
        <p class="katalog-empty__desc">Coba sesuaikan kata kunci atau atur ulang filter pencarian Anda.</p>
        <button type="button" class="katalog-empty__btn" id="btn-reset-filter-empty">Reset Semua Filter</button>
      </div>

      <!-- Loading Spinner Komponen untuk Batch Scroll / Infinite Lazy Load -->
      <div class="katalog-loader" id="katalog-loader" style="display: none;">
        <div class="katalog-spinner" aria-hidden="true"></div>
        <span class="katalog-loader-text">Memuat produk lainnya...</span>
      </div>

    </div>

    <!-- =======================================================
         POP-UP MODAL DRAWER: FILTER & SORT
         ======================================================= -->
    <div class="katalog-drawer-overlay" id="katalog-filter-drawer-overlay" aria-hidden="true" style="display:none;">
      <div class="katalog-drawer-card" id="katalog-filter-drawer" role="dialog" aria-modal="true" aria-labelledby="filter-drawer-title">
        
        <div class="katalog-drawer-header">
          <div class="katalog-drawer-title-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            <h2 id="filter-drawer-title" class="katalog-drawer-title">Filter &amp; Sort</h2>
          </div>
          <button type="button" class="katalog-drawer-close" id="btn-close-filter-drawer" aria-label="Tutup filter">&times;</button>
        </div>

        <div class="katalog-drawer-body">
          <!-- 1. Urutkan Berdasarkan -->
          <div class="katalog-filter-group">
            <h3 class="katalog-filter-group-title">Urutkan Produk</h3>
            <div class="katalog-filter-options">
              <label class="katalog-radio-item">
                <input type="radio" name="drawer_sort" value="terbaru" checked>
                <span>Terbaru</span>
              </label>
              <label class="katalog-radio-item">
                <input type="radio" name="drawer_sort" value="harga_asc">
                <span>Harga: Rendah ke Tinggi</span>
              </label>
              <label class="katalog-radio-item">
                <input type="radio" name="drawer_sort" value="harga_desc">
                <span>Harga: Tinggi ke Rendah</span>
              </label>
              <label class="katalog-radio-item">
                <input type="radio" name="drawer_sort" value="diskon_desc">
                <span>Diskon Terbesar (% OFF)</span>
              </label>
            </div>
          </div>

          <!-- 2. Status Ketersediaan (Ready vs PO vs Sold Out) -->
          <div class="katalog-filter-group">
            <h3 class="katalog-filter-group-title">Ketersediaan Stok</h3>
            <div class="katalog-filter-options">
              <label class="katalog-checkbox-item">
                <input type="checkbox" id="filter-status-ready" value="in_stock" checked>
                <span>Ready Stock (Tersedia)</span>
              </label>
              <label class="katalog-checkbox-item">
                <input type="checkbox" id="filter-status-po" value="pre_order" checked>
                <span>Pre-Order (PO)</span>
              </label>
              <label class="katalog-checkbox-item">
                <input type="checkbox" id="filter-status-soldout" value="out_of_stock">
                <span>Sertakan Produk Habis (Sold Out)</span>
              </label>
            </div>
          </div>

          <!-- 3. Rentang Harga -->
          <div class="katalog-filter-group">
            <h3 class="katalog-filter-group-title">Rentang Harga (IDR)</h3>
            <div class="katalog-price-inputs">
              <div class="katalog-price-field">
                <span class="katalog-price-prefix">Rp</span>
                <input type="number" id="filter-harga-min" placeholder="Min" min="0" step="10000">
              </div>
              <span class="katalog-price-separator">-</span>
              <div class="katalog-price-field">
                <span class="katalog-price-prefix">Rp</span>
                <input type="number" id="filter-harga-max" placeholder="Max" min="0" step="10000">
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Tombol Drawer -->
        <div class="katalog-drawer-footer">
          <button type="button" class="katalog-drawer-btn-reset" id="btn-reset-drawer">Reset</button>
          <button type="button" class="katalog-drawer-btn-apply" id="btn-apply-drawer">Terapkan Filter</button>
        </div>

      </div>
    </div>

    <!-- Toast Floating Notifikasi -->
    <div id="katalog-toast" class="katalog-toast" role="alert" aria-live="polite"></div>

  </main>

  <!-- Embedded JSON Data Produk dari Database -->
  <script type="application/json" id="katalog-payload-data">
  <?= json_encode([
    'kategoriAktif' => $slugKategoriAktif,
    'daftarKategori' => $daftarKategori,
    'daftarProduk' => $daftarProduk
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
  <script src="/js/halaman/katalog.js"></script>
  <script src="/js/aplikasi.js"></script>
</body>
</html>
