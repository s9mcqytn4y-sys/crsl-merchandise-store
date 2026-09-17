<?php
/**
 * CRSL Merchandise Store - Halaman Beranda
 * Fase 2: Hero Carousel (fit 100dvh), Karakter Showcase, dan Grid Produk Unggulan
 */
$apakahBeranda = true;
?>
<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CRSL - Animals as your Bestfriends!</title>
  <meta name="description" content="CRSL Merchandise Store. Temukan koleksi merchandise karakter hewan favorit kamu: ransel, slingbag, tumbler, pakaian, dan aksesoris.">

  <!-- Open Graph -->
  <meta property="og:title" content="CRSL - Animals as your Bestfriends!">
  <meta property="og:description" content="Temukan koleksi merchandise karakter hewan favorit kamu.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="<?= APP_URL ?>">

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
  <link rel="stylesheet" href="/css/komponen/hero-carousel.css">
  <link rel="stylesheet" href="/css/komponen/pre-order.css">
  <link rel="stylesheet" href="/css/komponen/divider-bts.css">
  <link rel="stylesheet" href="/css/komponen/bundle-section.css">
  <link rel="stylesheet" href="/css/komponen/karakter-showcase.css">
  <link rel="stylesheet" href="/css/komponen/produk-grid.css">
</head>
<body>
  <!-- Skip Navigation -->
  <a href="#konten-utama" class="lewati-navigasi">Lewati ke konten utama</a>

  <!-- ========== BILAH ATAS (Announcement Bar) ========== -->
  <div class="bilah-atas" role="region" aria-label="Pengumuman promo">
    <div class="bilah-atas__rotator">
      <!-- Diisi oleh JS dari i18n -->
    </div>
  </div>

  <!-- ========== NAVIGASI (Header) ========== -->
  <header class="navigasi" role="banner">
    <div class="navigasi__wadah">
      <!-- Cluster Kiri: Hamburger -->
      <div class="navigasi__kiri">
        <button
          type="button"
          id="tombol-menu"
          class="navigasi__tombol-ikon"
          aria-label="Buka menu navigasi"
          aria-expanded="false"
          aria-controls="menu-samping"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Cluster Tengah: Logo -->
      <div class="navigasi__tengah">
        <a href="/" class="navigasi__logo" aria-label="CRSL - Kembali ke beranda">
          <img src="/aset/gambar/logo-crsl.png" alt="CRSL Official" class="navigasi__logo-gambar" width="120" height="32" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';">
          <span class="navigasi__logo-teks" style="display:none;">CRSL</span>
        </a>
      </div>

      <!-- Cluster Kanan: Preferensi, Cari, Akun -->
      <div class="navigasi__kanan">
        <!-- Dark mode toggle -->
        <button
          type="button"
          id="tombol-tema"
          class="navigasi__tombol-ikon"
          aria-label="Ganti ke mode gelap"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <!-- Preferensi (Bendera + IDR) -->
        <button
          type="button"
          id="tombol-preferensi"
          class="navigasi__preferensi"
          aria-label="Pengaturan lokalisasi dan mata uang"
          aria-expanded="false"
          aria-controls="preferensi"
        >
          <img
            id="bendera-navigasi"
            src="/aset/ikon/bendera-id.svg"
            alt="Bendera Indonesia"
            class="navigasi__bendera"
            width="20"
            height="14"
          >
          <span id="teks-mata-uang" class="navigasi__mata-uang">IDR</span>
        </button>

        <!-- Tombol Cari -->
        <button
          type="button"
          id="tombol-cari"
          class="navigasi__tombol-ikon"
          aria-label="Buka pencarian"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>

        <!-- Tombol Akun -->
        <a
          href="/akun"
          class="navigasi__tombol-ikon"
          aria-label="Akun saya"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </a>
      </div>
    </div>
  </header>

  <!-- ========== MENU SAMPING (Drawer - Fit 100dvh) ========== -->
  <div id="menu-samping-overlay" class="menu-samping__overlay" aria-hidden="true"></div>
  <nav
    id="menu-samping"
    class="menu-samping"
    role="dialog"
    aria-modal="true"
    aria-label="Menu navigasi"
    aria-hidden="true"
  >
    <div class="menu-samping__header">
      <button
        type="button"
        id="tombol-cari-drawer"
        class="menu-samping__tombol-cari"
        aria-label="Buka pencarian"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>
      <button
        type="button"
        id="tombol-tutup-menu"
        class="menu-samping__tombol-tutup"
        aria-label="Tutup menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Nav list -->
    <ul class="menu-samping__daftar">
      <li class="menu-samping__item">
        <a href="#bundles" class="menu-samping__tautan">BTS Must-Have Bundle <span class="menu-samping__emoji">&#x1F392;</span></a>
      </li>
      <li class="menu-samping__item">
        <a href="#pre-order" class="menu-samping__tautan menu-samping__tautan--promo">Pre-Order Now <span class="menu-samping__emoji">&#x1F525;</span></a>
      </li>
      <li class="menu-samping__item">
        <a href="#karakter-crsl" class="menu-samping__tautan">Karakter CRSL <span class="menu-samping__emoji">&#x1F43E;</span></a>
      </li>
      <li class="menu-samping__item">
        <a href="#produk-unggulan" class="menu-samping__tautan">Katalog Produk <span class="menu-samping__emoji">&#x2728;</span></a>
      </li>
      <li class="menu-samping__item">
        <a href="/kategori/backpack-collection" class="menu-samping__tautan">Backpacks</a>
      </li>
      <li class="menu-samping__item">
        <a href="/kategori/slingbag-collection" class="menu-samping__tautan">Slingbags</a>
      </li>
      <li class="menu-samping__item">
        <a href="/kategori/tumbler-collection" class="menu-samping__tautan">Tumbler Collection</a>
      </li>
      <li class="menu-samping__item">
        <a href="/kategori/wallet-accessories" class="menu-samping__tautan">Wallet &amp; Accessories</a>
      </li>
    </ul>
  </nav>

  <!-- ========== PENCARIAN (Gambar 1) ========== -->
  <?php require_once PUBLIK_DIR . '/komponen/pencarian.php'; ?>

  <!-- ========== PREFERENSI ========== -->
  <?php require_once PUBLIK_DIR . '/komponen/preferensi.php'; ?>

  <!-- ========== KERANJANG (Gambar 1, 2, 3) ========== -->
  <?php require_once PUBLIK_DIR . '/komponen/keranjang.php'; ?>

  <!-- ========== FLOATING CTAs (WhatsApp & Voucher) ========== -->
  <?php require_once PUBLIK_DIR . '/komponen/cta-mengambang.php'; ?>

  <!-- ========== MODAL OTENTIKASI ========== -->
  <?php require_once PUBLIK_DIR . '/komponen/modal-otentikasi.php'; ?>

  <!-- ========== KONTEN UTAMA: FASE 2 & BUNDLES ========== -->
  <main id="konten-utama">
    <!-- 1. Hero Banner Carousel (Fit 1 Layar / 100dvh) -->
    <?php require_once PUBLIK_DIR . '/komponen/hero-carousel.php'; ?>

    <!-- 1b. Pre-Order Now Section (crsl-store.id Official Flow) -->
    <?php require_once PUBLIK_DIR . '/komponen/pre-order.php'; ?>

    <!-- 1c. Tartan Divider Banner BTS 2026 -->
    <?php require_once PUBLIK_DIR . '/komponen/divider-bts.php'; ?>

    <!-- 1d. Seksi 2-Kolom BTS Must-Have Bundle -->
    <?php require_once PUBLIK_DIR . '/komponen/bundle-section.php'; ?>

    <!-- 2. Karakter Showcase CRSL (Odin, Chilo, Pigko, Popo, Choco) -->
    <?php require_once PUBLIK_DIR . '/komponen/karakter-showcase.php'; ?>

    <!-- 3. Grid Produk Unggulan & Quick Cart -->
    <?php require_once PUBLIK_DIR . '/komponen/produk-grid.php'; ?>
  </main>

  <!-- JS: order matters -->
  <script src="/js/utilitas/i18n.js"></script>
  <script src="/js/komponen/bilah-atas.js"></script>
  <script src="/js/komponen/navigasi.js"></script>
  <script src="/js/komponen/menu-samping.js"></script>
  <script src="/js/komponen/pencarian.js"></script>
  <script src="/js/komponen/preferensi.js"></script>
  <script src="/js/komponen/keranjang.js"></script>
  <script src="/js/komponen/cta-mengambang.js"></script>
  <script src="/js/komponen/otentikasi.js"></script>
  <script src="/js/komponen/hero-carousel.js"></script>
  <script src="/js/komponen/karakter-showcase.js"></script>
  <script src="/js/aplikasi.js"></script>
</body>
</html>
