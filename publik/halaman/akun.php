<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Account - CRSL</title>
  <meta name="description" content="Kelola akun CRSL Anda. Lihat pesanan, wishlist, dan nikmati program loyalitas eksklusif.">

  <!-- CSS -->
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
  <style>
    /* Akun page styles matching Image 4 */
    .akun {
      max-width: 960px;
      margin-inline: auto;
      padding: var(--jarak-xl) var(--jarak-md);
      min-height: 70vh;
    }

    .akun__judul {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: var(--jarak-xl);
      color: var(--warna-teks);
    }

    /* CTA Banner (Image 4) */
    .akun__banner {
      display: flex;
      flex-direction: column;
      gap: var(--jarak-lg);
      padding: var(--jarak-lg) var(--jarak-xl);
      background-color: var(--warna-latar-sekunder);
      border-radius: var(--radius-lg);
      margin-bottom: var(--jarak-2xl);
      border: 1px solid var(--warna-batas);
    }

    @media (min-width: 768px) {
      .akun__banner {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .akun__banner-teks {
      flex: 1;
      max-width: 620px;
    }

    .akun__banner-judul {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--warna-teks);
    }

    .akun__banner-subjudul {
      font-size: 13px;
      color: var(--warna-teks-sekunder);
      line-height: 1.5;
    }

    .akun__banner-aksi {
      display: flex;
      gap: var(--jarak-sm);
      flex-shrink: 0;
      align-items: center;
    }

    /* Sesuai Poin 6 & Gambar 4: Outlined Login & Solid Red Signup */
    .akun__tombol {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 24px;
      border-radius: var(--radius-penuh);
      font-size: 14px;
      font-weight: 600;
      min-height: 40px;
      cursor: pointer;
      transition: all var(--transisi-cepat);
      text-decoration: none;
    }

    .akun__tombol--login {
      background-color: #ffffff;
      color: var(--warna-primer);
      border: 1px solid var(--warna-primer);
    }

    .akun__tombol--login:hover {
      background-color: var(--warna-primer-pudar);
    }

    .akun__tombol--signup {
      background-color: var(--warna-primer);
      color: #ffffff;
      border: 1px solid var(--warna-primer);
    }

    .akun__tombol--signup:hover {
      background-color: var(--warna-primer-gelap);
      border-color: var(--warna-primer-gelap);
    }

    /* Tabs (Image 4) */
    .akun__tab-wadah {
      border-bottom: 1px solid var(--warna-batas);
      margin-bottom: var(--jarak-xl);
    }

    .akun__tab-list {
      display: flex;
      gap: 0;
    }

    .akun__tab {
      flex: 1;
      text-align: center;
      padding: var(--jarak-md) var(--jarak-lg);
      font-size: 15px;
      font-weight: 500;
      color: var(--warna-teks-sekunder);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color var(--transisi-cepat), border-color var(--transisi-cepat);
      min-height: 44px;
    }

    .akun__tab:hover {
      color: var(--warna-teks);
    }

    .akun__tab.aktif {
      color: var(--warna-teks);
      border-bottom: 2px solid var(--warna-teks);
      font-weight: 600;
    }

    /* Tab content */
    .akun__tab-konten {
      display: none;
    }

    .akun__tab-konten.aktif {
      display: block;
    }

    /* Orders section header (Image 4) */
    .akun__pesanan-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jarak-md);
      margin-bottom: var(--jarak-2xl);
    }

    .akun__pesanan-judul {
      font-size: 16px;
      font-weight: 600;
      color: var(--warna-teks);
    }

    .akun__status-select {
      padding: 8px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--warna-batas);
      background-color: var(--warna-latar);
      color: var(--warna-teks);
      font-size: 14px;
      cursor: pointer;
      min-width: 140px;
    }

    /* Empty state box (Image 4) */
    .akun__kosong {
      text-align: center;
      padding: var(--jarak-3xl) var(--jarak-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .akun__kosong-ikon {
      width: 72px;
      height: 72px;
      margin-bottom: var(--jarak-md);
      color: #b0b7c3;
    }

    .akun__kosong-judul {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--warna-teks);
    }

    .akun__kosong-subjudul {
      font-size: 14px;
      color: var(--warna-teks-sekunder);
    }
  </style>
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
        <button type="button" id="tombol-tema" class="navigasi__tombol-ikon" aria-label="Ganti ke mode gelap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button type="button" id="tombol-preferensi" class="navigasi__preferensi" aria-label="Pengaturan lokalisasi" aria-expanded="false" aria-controls="preferensi">
          <img id="bendera-navigasi" src="/aset/ikon/bendera-id.svg" alt="Bendera Indonesia" class="navigasi__bendera" width="20" height="14">
          <span id="teks-mata-uang" class="navigasi__mata-uang">IDR</span>
        </button>
        <button type="button" id="tombol-cari" class="navigasi__tombol-ikon" aria-label="Buka pencarian">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <a href="/akun" class="navigasi__tombol-ikon" aria-label="Akun saya" aria-current="page">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- ========== MENU SAMPING DRAWER ========== -->
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
      <li class="menu-samping__item"><a href="/#bts-collection" class="menu-samping__tautan">BTS Collection <span class="menu-samping__emoji">&#x1F392;</span></a></li>
      <li class="menu-samping__item"><a href="/#produk-unggulan" class="menu-samping__tautan">All Products</a></li>
      <li class="menu-samping__item"><a href="/#promo" class="menu-samping__tautan menu-samping__tautan--promo">All Day Promo <span class="menu-samping__emoji">&#x1F525;</span></a></li>
      <li class="menu-samping__item"><a href="/kategori/backpack-collection" class="menu-samping__tautan">Backpacks</a></li>
      <li class="menu-samping__item"><a href="/kategori/slingbag-collection" class="menu-samping__tautan">Slingbags</a></li>
      <li class="menu-samping__item"><a href="/kategori/tumbler-collection" class="menu-samping__tautan">Tumbler Collection</a></li>
      <li class="menu-samping__item"><a href="/kategori/tops-collection" class="menu-samping__tautan">Tops</a></li>
      <li class="menu-samping__item"><a href="/kategori/bottoms-collection" class="menu-samping__tautan">Bottoms</a></li>
      <li class="menu-samping__item"><a href="/kategori/outerwears-collection" class="menu-samping__tautan">Outerwears</a></li>
      <li class="menu-samping__item"><a href="/kategori/footwear-collection" class="menu-samping__tautan">Footwears</a></li>
      <li class="menu-samping__item"><a href="/kategori/headwear-collection" class="menu-samping__tautan">Headwears</a></li>
      <li class="menu-samping__item"><a href="/kategori/wallet-accessories" class="menu-samping__tautan">Wallet &amp; Accessories</a></li>
      <li class="menu-samping__item"><a href="/#whats-poppin" class="menu-samping__tautan">What's Poppin'</a></li>
    </ul>
  </nav>

  <!-- ========== OVERLAY PENCARIAN (Gambar 1) ========== -->
  <?php require __DIR__ . '/../komponen/pencarian.php'; ?>

  <!-- ========== MODAL PREFERENSI ========== -->
  <?php require __DIR__ . '/../komponen/preferensi.php'; ?>

  <!-- ========== MODAL & DRAWER KERANJANG (Gambar 2 & 3) ========== -->
  <?php require __DIR__ . '/../komponen/keranjang.php'; ?>

  <!-- ========== STICKY CTA (Gambar 7 & 7b) ========== -->
  <?php require __DIR__ . '/../komponen/cta-mengambang.php'; ?>

  <!-- ========== MODAL OTENTIKASI & VERIFIKASI (Gambar 4 & 5) ========== -->
  <?php require __DIR__ . '/../komponen/modal-otentikasi.php'; ?>

  <!-- ========== KONTEN UTAMA: AKUN (Gambar 4) ========== -->
  <main id="konten-utama">
    <div class="akun">
      <h1 class="akun__judul">My Account</h1>

      <!-- Banner CTA (Gambar 4) -->
      <div class="akun__banner">
        <div class="akun__banner-teks">
          <h2 class="akun__banner-judul">Join as a member to get more benefits</h2>
          <p class="akun__banner-subjudul">As a CRSL member, enjoy exclusive benefits, discounts, and earn points effortlessly with our free loyalty program.</p>
        </div>
        <div class="akun__banner-aksi">
          <button type="button" class="akun__tombol akun__tombol--login" id="tombol-buka-masuk">Login</button>
          <button type="button" class="akun__tombol akun__tombol--signup" id="tombol-buka-daftar">Signup</button>
        </div>
      </div>

      <!-- Tabs: Orders | Wishlist (Gambar 4) -->
      <div class="akun__tab-wadah" role="tablist" aria-label="Navigasi akun">
        <div class="akun__tab-list">
          <button type="button" class="akun__tab aktif" role="tab" aria-selected="true" aria-controls="panel-pesanan" id="tab-pesanan">Orders</button>
          <button type="button" class="akun__tab" role="tab" aria-selected="false" aria-controls="panel-wishlist" id="tab-wishlist">Wishlist</button>
        </div>
      </div>

      <!-- Tab Konten: Orders (Gambar 4) -->
      <div class="akun__tab-konten aktif" id="panel-pesanan" role="tabpanel" aria-labelledby="tab-pesanan">
        <div class="akun__pesanan-header">
          <h3 class="akun__pesanan-judul">My Orders (0)</h3>
          <select class="akun__status-select" aria-label="Filter status pesanan">
            <option value="all">All status</option>
            <option value="unpaid">Unpaid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Empty state box (Gambar 4) -->
        <div class="akun__kosong">
          <svg class="akun__kosong-ikon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M32 6L54 18V46L32 58L10 46V18L32 6Z"/>
            <path d="M10 18L32 30L54 18"/>
            <path d="M32 30V58"/>
            <path d="M21 12L43 24"/>
          </svg>
          <h4 class="akun__kosong-judul">No Orders Found</h4>
          <p class="akun__kosong-subjudul">Place an order to see it listed here.</p>
        </div>
      </div>

      <!-- Tab Konten: Wishlist -->
      <div class="akun__tab-konten" id="panel-wishlist" role="tabpanel" aria-labelledby="tab-wishlist">
        <div class="akun__kosong">
          <svg class="akun__kosong-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h4 class="akun__kosong-judul">Your Wishlist is Empty</h4>
          <p class="akun__kosong-subjudul">Explore our products and save your favorites here.</p>
        </div>
      </div>
    </div>
  </main>

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
  <script src="/js/aplikasi.js"></script>
  <script>
    // Tab switching for Orders / Wishlist
    document.addEventListener('DOMContentLoaded', () => {
      const tabs = document.querySelectorAll('.akun__tab');
      const panels = document.querySelectorAll('.akun__tab-konten');

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          tabs.forEach((t) => {
            t.classList.remove('aktif');
            t.setAttribute('aria-selected', 'false');
          });
          panels.forEach((p) => p.classList.remove('aktif'));

          tab.classList.add('aktif');
          tab.setAttribute('aria-selected', 'true');
          const target = document.getElementById(tab.getAttribute('aria-controls'));
          target?.classList.add('aktif');
        });
      });
    });
  </script>
</body>
</html>
