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

  <!-- CSS -->
  <link rel="stylesheet" href="/css/variabel.css">
  <link rel="stylesheet" href="/css/dasar.css">
  <link rel="stylesheet" href="/css/tata-letak.css">
  <link rel="stylesheet" href="/css/komponen/bilah-atas.css">
  <link rel="stylesheet" href="/css/komponen/navigasi.css">
  <link rel="stylesheet" href="/css/komponen/menu-samping.css">
  <link rel="stylesheet" href="/css/komponen/pencarian.css">
  <link rel="stylesheet" href="/css/komponen/preferensi.css">
</head>
<body>
  <!-- Skip Navigation -->
  <a href="#konten-utama" class="lewati-navigasi">Lewati ke konten utama</a>

  <!-- ========== BILAH ATAS (Announcement Bar) ========== -->
  <div class="bilah-atas" role="marquee" aria-label="Pengumuman promo">
    <div class="bilah-atas__jalur">
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
          <span class="navigasi__logo-teks">CRSL</span>
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

  <!-- ========== MENU SAMPING (Drawer) ========== -->
  <div id="menu-samping-overlay" class="menu-samping__overlay" aria-hidden="true"></div>
  <nav
    id="menu-samping"
    class="menu-samping"
    role="dialog"
    aria-modal="true"
    aria-label="Menu navigasi"
    aria-hidden="true"
  >
    <!-- Header: Search + Close -->
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
        <a href="#" class="menu-samping__tautan">BTS Collection <span class="menu-samping__emoji">&#x1F392;</span></a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">All Products</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan menu-samping__tautan--promo">All Day Promo <span class="menu-samping__emoji">&#x1F525;</span></a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">Backpacks</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">Slingbags</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">Tumbler Collection</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">Tops</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">Bottoms</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">Outerwears</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">Footwears</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">Headwears</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">Wallet &amp; Accessories</a>
      </li>
      <li class="menu-samping__item">
        <a href="#" class="menu-samping__tautan">What's Poppin'</a>
      </li>
    </ul>
  </nav>

  <!-- ========== PENCARIAN (Search Overlay) ========== -->
  <div id="pencarian-overlay" class="pencarian__overlay" aria-hidden="true"></div>
  <div
    id="pencarian"
    class="pencarian"
    role="dialog"
    aria-modal="true"
    aria-label="Pencarian produk"
  >
    <div class="pencarian__bar">
      <div class="pencarian__input-wadah">
        <input
          type="search"
          id="pencarian-input"
          class="pencarian__input"
          placeholder="Cari produk kami"
          autocomplete="off"
          aria-label="Cari produk"
        >
        <button type="button" class="pencarian__tombol-kirim" aria-label="Cari">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>
      <button
        type="button"
        id="tombol-tutup-pencarian"
        class="pencarian__tombol-tutup"
        aria-label="Tutup pencarian"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="pencarian__populer">
      <p class="pencarian__populer-judul">Istilah Pencarian Populer</p>
      <div class="pencarian__tag-wadah">
        <!-- Diisi oleh JS -->
      </div>
    </div>
  </div>

  <!-- ========== PREFERENSI (Localization Modal) ========== -->
  <div id="preferensi-overlay" class="preferensi__overlay" aria-hidden="true"></div>
  <div
    id="preferensi"
    class="preferensi"
    role="dialog"
    aria-modal="true"
    aria-label="Pengaturan lokalisasi"
  >
    <!-- Deliver to -->
    <div class="preferensi__grup">
      <label for="select-negara" class="preferensi__label">Kirim ke</label>
      <div class="preferensi__select-wadah">
        <select id="select-negara" class="preferensi__select">
          <option value="ID">&#x1F1EE;&#x1F1E9; Indonesia</option>
          <option value="MY">&#x1F1F2;&#x1F1FE; Malaysia</option>
          <option value="SG">&#x1F1F8;&#x1F1EC; Singapore</option>
        </select>
      </div>
    </div>

    <!-- Language -->
    <div class="preferensi__grup">
      <label for="select-bahasa" class="preferensi__label">Bahasa</label>
      <select id="select-bahasa" class="preferensi__select">
        <option value="en">English</option>
        <option value="id" selected>Bahasa Indonesia</option>
      </select>
    </div>

    <!-- Currency -->
    <div class="preferensi__grup">
      <label for="select-mata-uang" class="preferensi__label">Mata Uang</label>
      <select id="select-mata-uang" class="preferensi__select">
        <option value="IDR">IDR - Rupiah Indonesia</option>
        <option value="USD">USD - United States Dollar</option>
        <option value="SGD">SGD - Singapore Dollar</option>
        <option value="MYR">MYR - Malaysian Ringgit</option>
        <option value="THB">THB - Thai Baht</option>
        <option value="EUR">EUR - Euro</option>
      </select>
    </div>

    <!-- Save button -->
    <button type="button" id="tombol-simpan-preferensi" class="preferensi__simpan">Simpan</button>
  </div>

  <!-- ========== KONTEN UTAMA ========== -->
  <main id="konten-utama">
    <section style="padding: var(--jarak-3xl) var(--jarak-md); text-align: center;">
      <h1 style="font-size: var(--teks-h1); margin-bottom: var(--jarak-md);">CRSL Merchandise Store</h1>
      <p style="color: var(--warna-teks-sekunder); max-width: 480px; margin-inline: auto;">
        Halaman beranda sedang dalam pengembangan. Topbar dan navigasi sudah aktif. Coba buka hamburger menu, pencarian, pengaturan lokalisasi, atau kunjungi halaman akun.
      </p>
      <div style="margin-top: var(--jarak-xl); display: flex; gap: var(--jarak-md); justify-content: center; flex-wrap: wrap;">
        <a href="/akun" style="display: inline-flex; align-items: center; padding: var(--jarak-sm) var(--jarak-xl); background: var(--warna-teks); color: var(--warna-teks-invers); border-radius: var(--radius-penuh); font-weight: 600; min-height: 44px; text-decoration: none; transition: background-color 0.15s ease;">
          Akun Saya
        </a>
      </div>
    </section>
  </main>

  <!-- JS: order matters (i18n first, then components, then app init) -->
  <script src="/js/utilitas/i18n.js"></script>
  <script src="/js/komponen/bilah-atas.js"></script>
  <script src="/js/komponen/navigasi.js"></script>
  <script src="/js/komponen/menu-samping.js"></script>
  <script src="/js/komponen/pencarian.js"></script>
  <script src="/js/komponen/preferensi.js"></script>
  <script src="/js/aplikasi.js"></script>
</body>
</html>
