<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Akun Saya - CRSL</title>
  <meta name="description" content="Kelola akun CRSL Anda. Lihat pesanan, wishlist, dan kelola preferensi.">

  <!-- CSS -->
  <link rel="stylesheet" href="/css/variabel.css">
  <link rel="stylesheet" href="/css/dasar.css">
  <link rel="stylesheet" href="/css/tata-letak.css">
  <link rel="stylesheet" href="/css/komponen/bilah-atas.css">
  <link rel="stylesheet" href="/css/komponen/navigasi.css">
  <link rel="stylesheet" href="/css/komponen/menu-samping.css">
  <link rel="stylesheet" href="/css/komponen/pencarian.css">
  <link rel="stylesheet" href="/css/komponen/preferensi.css">
  <style>
    /* Akun page specific styles */
    .akun {
      max-width: 960px;
      margin-inline: auto;
      padding: var(--jarak-xl) var(--jarak-md);
    }

    .akun__judul {
      font-size: var(--teks-h1);
      font-weight: 400;
      margin-bottom: var(--jarak-xl);
      color: var(--warna-teks);
    }

    /* CTA Banner */
    .akun__banner {
      display: flex;
      flex-direction: column;
      gap: var(--jarak-lg);
      padding: var(--jarak-lg);
      background-color: var(--warna-latar-sekunder);
      border-radius: var(--radius-lg);
      margin-bottom: var(--jarak-xl);
    }

    @media (min-width: 600px) {
      .akun__banner {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .akun__banner-teks {
      flex: 1;
    }

    .akun__banner-judul {
      font-size: var(--teks-h3);
      font-weight: 600;
      margin-bottom: var(--jarak-sm);
      color: var(--warna-teks);
    }

    .akun__banner-subjudul {
      font-size: var(--teks-body);
      color: var(--warna-teks-sekunder);
      line-height: 1.5;
    }

    .akun__banner-aksi {
      display: flex;
      gap: var(--jarak-sm);
      flex-shrink: 0;
    }

    .akun__tombol {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--jarak-sm) var(--jarak-xl);
      border-radius: var(--radius-penuh);
      font-size: var(--teks-body);
      font-weight: 600;
      min-height: 44px;
      min-width: 100px;
      cursor: pointer;
      transition: background-color var(--transisi-cepat), color var(--transisi-cepat);
      text-decoration: none;
      border: none;
    }

    .akun__tombol--primer {
      background-color: var(--warna-teks);
      color: var(--warna-teks-invers);
    }

    .akun__tombol--primer:hover {
      background-color: var(--warna-primer);
    }

    .akun__tombol--sekunder {
      background-color: transparent;
      color: var(--warna-teks);
      border: 1px solid var(--warna-batas);
    }

    .akun__tombol--sekunder:hover {
      border-color: var(--warna-teks);
    }

    .akun__tombol:focus-visible {
      outline: 2px solid var(--warna-batas-fokus);
      outline-offset: 2px;
    }

    /* Tabs */
    .akun__tab-wadah {
      border-bottom: 1px solid var(--warna-batas);
      margin-bottom: var(--jarak-lg);
    }

    .akun__tab-list {
      display: flex;
      gap: 0;
    }

    .akun__tab {
      padding: var(--jarak-md) var(--jarak-lg);
      font-size: var(--teks-body);
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
      border-bottom-color: var(--warna-teks);
      font-weight: 600;
    }

    .akun__tab:focus-visible {
      outline: 2px solid var(--warna-batas-fokus);
      outline-offset: -2px;
    }

    /* Tab content */
    .akun__tab-konten {
      display: none;
    }

    .akun__tab-konten.aktif {
      display: block;
    }

    /* Orders section */
    .akun__pesanan-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--jarak-md);
      margin-bottom: var(--jarak-lg);
    }

    .akun__pesanan-judul {
      font-size: var(--teks-h4);
      font-weight: 600;
    }

    .akun__filter-wadah {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jarak-xs);
    }

    .akun__filter {
      padding: var(--jarak-xs) var(--jarak-md);
      border-radius: var(--radius-penuh);
      font-size: var(--teks-caption);
      background-color: transparent;
      color: var(--warna-teks-sekunder);
      border: 1px solid var(--warna-batas);
      cursor: pointer;
      transition: background-color var(--transisi-cepat), color var(--transisi-cepat);
      min-height: 32px;
    }

    .akun__filter:hover,
    .akun__filter.aktif {
      background-color: var(--warna-teks);
      color: var(--warna-teks-invers);
      border-color: var(--warna-teks);
    }

    .akun__filter:focus-visible {
      outline: 2px solid var(--warna-batas-fokus);
      outline-offset: 2px;
    }

    /* Empty state */
    .akun__kosong {
      text-align: center;
      padding: var(--jarak-3xl) var(--jarak-md);
    }

    .akun__kosong-ikon {
      width: 64px;
      height: 64px;
      margin-inline: auto;
      margin-bottom: var(--jarak-md);
      color: var(--warna-teks-pudar);
    }

    .akun__kosong-judul {
      font-size: var(--teks-h4);
      font-weight: 600;
      margin-bottom: var(--jarak-sm);
      color: var(--warna-teks);
    }

    .akun__kosong-subjudul {
      font-size: var(--teks-body);
      color: var(--warna-teks-sekunder);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      background-color: var(--warna-latar-overlay);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--transisi-normal), visibility var(--transisi-normal);
    }

    .modal-overlay.aktif {
      opacity: 1;
      visibility: visible;
    }

    .modal {
      width: 90vw;
      max-width: 420px;
      background-color: var(--warna-latar);
      border-radius: var(--radius-lg);
      padding: var(--jarak-xl);
      box-shadow: var(--bayangan-lg);
      transform: translateY(20px);
      transition: transform var(--transisi-normal);
    }

    .modal-overlay.aktif .modal {
      transform: translateY(0);
    }

    .modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--jarak-lg);
    }

    .modal__judul {
      font-size: var(--teks-h3);
      font-weight: 600;
    }

    .modal__tutup {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-width: 44px;
      min-height: 44px;
      border-radius: var(--radius-penuh);
      color: var(--warna-teks);
      background: transparent;
      cursor: pointer;
      border: none;
      transition: background-color var(--transisi-cepat);
    }

    .modal__tutup:hover {
      background-color: var(--warna-latar-sekunder);
    }

    .modal__tutup:focus-visible {
      outline: 2px solid var(--warna-batas-fokus);
      outline-offset: 2px;
    }

    .modal__tutup svg {
      width: 20px;
      height: 20px;
      pointer-events: none;
    }

    .modal__grup {
      margin-bottom: var(--jarak-md);
    }

    .modal__label {
      display: block;
      font-size: var(--teks-caption);
      font-weight: 500;
      color: var(--warna-teks-sekunder);
      margin-bottom: var(--jarak-xs);
    }

    .modal__input {
      width: 100%;
      padding: var(--jarak-sm) var(--jarak-md);
      border: 1px solid var(--warna-batas);
      border-radius: var(--radius-md);
      font-size: var(--teks-body);
      color: var(--warna-teks);
      background-color: var(--warna-latar);
      min-height: 44px;
      transition: border-color var(--transisi-cepat);
    }

    .modal__input:focus {
      border-color: var(--warna-batas-fokus);
      outline: none;
    }

    .modal__input::placeholder {
      color: var(--warna-teks-pudar);
    }

    .modal__tombol {
      width: 100%;
      padding: var(--jarak-sm) var(--jarak-lg);
      background-color: var(--warna-teks);
      color: var(--warna-teks-invers);
      border: none;
      border-radius: var(--radius-penuh);
      font-size: var(--teks-body);
      font-weight: 600;
      cursor: pointer;
      min-height: 44px;
      transition: background-color var(--transisi-cepat);
      margin-top: var(--jarak-md);
    }

    .modal__tombol:hover {
      background-color: var(--warna-primer);
    }

    .modal__tombol:focus-visible {
      outline: 2px solid var(--warna-batas-fokus);
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <!-- Skip Navigation -->
  <a href="#konten-utama" class="lewati-navigasi">Lewati ke konten utama</a>

  <!-- ========== BILAH ATAS ========== -->
  <div class="bilah-atas" role="marquee" aria-label="Pengumuman promo">
    <div class="bilah-atas__jalur"></div>
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
        <a href="/" class="navigasi__logo" aria-label="CRSL - Kembali ke beranda"><span class="navigasi__logo-teks">CRSL</span></a>
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

  <!-- Drawer + Search + Preferensi (sama seperti beranda) -->
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
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">BTS Collection <span class="menu-samping__emoji">&#x1F392;</span></a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">All Products</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan menu-samping__tautan--promo">All Day Promo <span class="menu-samping__emoji">&#x1F525;</span></a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">Backpacks</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">Slingbags</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">Tumbler Collection</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">Tops</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">Bottoms</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">Outerwears</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">Footwears</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">Headwears</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">Wallet &amp; Accessories</a></li>
      <li class="menu-samping__item"><a href="#" class="menu-samping__tautan">What's Poppin'</a></li>
    </ul>
  </nav>

  <div id="pencarian-overlay" class="pencarian__overlay" aria-hidden="true"></div>
  <div id="pencarian" class="pencarian" role="dialog" aria-modal="true" aria-label="Pencarian produk">
    <div class="pencarian__bar">
      <div class="pencarian__input-wadah">
        <input type="search" id="pencarian-input" class="pencarian__input" placeholder="Cari produk kami" autocomplete="off" aria-label="Cari produk">
        <button type="button" class="pencarian__tombol-kirim" aria-label="Cari">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>
      <button type="button" id="tombol-tutup-pencarian" class="pencarian__tombol-tutup" aria-label="Tutup pencarian">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="pencarian__populer">
      <p class="pencarian__populer-judul">Istilah Pencarian Populer</p>
      <div class="pencarian__tag-wadah"></div>
    </div>
  </div>

  <div id="preferensi-overlay" class="preferensi__overlay" aria-hidden="true"></div>
  <div id="preferensi" class="preferensi" role="dialog" aria-modal="true" aria-label="Pengaturan lokalisasi">
    <div class="preferensi__grup">
      <label for="select-negara" class="preferensi__label">Kirim ke</label>
      <select id="select-negara" class="preferensi__select">
        <option value="ID">&#x1F1EE;&#x1F1E9; Indonesia</option>
        <option value="MY">&#x1F1F2;&#x1F1FE; Malaysia</option>
        <option value="SG">&#x1F1F8;&#x1F1EC; Singapore</option>
      </select>
    </div>
    <div class="preferensi__grup">
      <label for="select-bahasa" class="preferensi__label">Bahasa</label>
      <select id="select-bahasa" class="preferensi__select">
        <option value="en">English</option>
        <option value="id" selected>Bahasa Indonesia</option>
      </select>
    </div>
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
    <button type="button" id="tombol-simpan-preferensi" class="preferensi__simpan">Simpan</button>
  </div>

  <!-- ========== KONTEN UTAMA: AKUN ========== -->
  <main id="konten-utama">
    <div class="akun">
      <h1 class="akun__judul">Akun Saya</h1>

      <!-- Banner CTA -->
      <div class="akun__banner">
        <div class="akun__banner-teks">
          <h2 class="akun__banner-judul">Bergabung sebagai member untuk lebih banyak keuntungan</h2>
          <p class="akun__banner-subjudul">Sebagai member CRSL, nikmati benefit eksklusif, diskon, dan kumpulkan poin dengan mudah melalui program loyalitas gratis kami.</p>
        </div>
        <div class="akun__banner-aksi">
          <button type="button" class="akun__tombol akun__tombol--primer" id="tombol-buka-masuk">Masuk</button>
          <button type="button" class="akun__tombol akun__tombol--sekunder" id="tombol-buka-daftar">Daftar</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="akun__tab-wadah" role="tablist" aria-label="Navigasi akun">
        <div class="akun__tab-list">
          <button type="button" class="akun__tab aktif" role="tab" aria-selected="true" aria-controls="panel-pesanan" id="tab-pesanan">Pesanan</button>
          <button type="button" class="akun__tab" role="tab" aria-selected="false" aria-controls="panel-wishlist" id="tab-wishlist">Wishlist</button>
        </div>
      </div>

      <!-- Tab: Pesanan -->
      <div class="akun__tab-konten aktif" id="panel-pesanan" role="tabpanel" aria-labelledby="tab-pesanan">
        <div class="akun__pesanan-header">
          <h3 class="akun__pesanan-judul">Pesanan Saya (0)</h3>
        </div>
        <div class="akun__filter-wadah">
          <button type="button" class="akun__filter aktif">Semua Status</button>
          <button type="button" class="akun__filter">Belum Bayar</button>
          <button type="button" class="akun__filter">Akan Dikirim</button>
          <button type="button" class="akun__filter">Dikirim</button>
          <button type="button" class="akun__filter">Selesai</button>
          <button type="button" class="akun__filter">Dibatalkan</button>
          <button type="button" class="akun__filter">Dikembalikan</button>
        </div>

        <!-- Empty state -->
        <div class="akun__kosong">
          <svg class="akun__kosong-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 10h20"/>
            <path d="M12 14h.01"/>
          </svg>
          <h4 class="akun__kosong-judul">Belum Ada Pesanan</h4>
          <p class="akun__kosong-subjudul">Buat pesanan untuk melihatnya tercantum di sini.</p>
        </div>
      </div>

      <!-- Tab: Wishlist -->
      <div class="akun__tab-konten" id="panel-wishlist" role="tabpanel" aria-labelledby="tab-wishlist">
        <div class="akun__kosong">
          <svg class="akun__kosong-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h4 class="akun__kosong-judul">Wishlist Anda Kosong</h4>
          <p class="akun__kosong-subjudul">Silakan cek kembali nanti untuk pembaruan.</p>
        </div>
      </div>
    </div>
  </main>

  <!-- ========== LOGIN MODAL ========== -->
  <div class="modal-overlay" id="modal-masuk" aria-hidden="true">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="masuk-judul">
      <div class="modal__header">
        <h2 id="masuk-judul" class="modal__judul">Masuk ke Akun</h2>
        <button type="button" class="modal__tutup" aria-label="Tutup modal masuk" data-tutup="modal-masuk">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form>
        <div class="modal__grup">
          <label for="masuk-email" class="modal__label">Email atau Nomor Telepon</label>
          <input type="text" id="masuk-email" class="modal__input" placeholder="contoh@email.com" autocomplete="email" required>
        </div>
        <button type="submit" class="modal__tombol">Masuk</button>
      </form>
    </div>
  </div>

  <!-- ========== SIGNUP MODAL ========== -->
  <div class="modal-overlay" id="modal-daftar" aria-hidden="true">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="daftar-judul">
      <div class="modal__header">
        <h2 id="daftar-judul" class="modal__judul">Buat Akun Baru</h2>
        <button type="button" class="modal__tutup" aria-label="Tutup modal daftar" data-tutup="modal-daftar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form>
        <div class="modal__grup">
          <label for="daftar-nama" class="modal__label">Nama Lengkap</label>
          <input type="text" id="daftar-nama" class="modal__input" placeholder="Nama lengkap Anda" autocomplete="name" required>
        </div>
        <div class="modal__grup">
          <label for="daftar-email" class="modal__label">Email Anda</label>
          <input type="email" id="daftar-email" class="modal__input" placeholder="contoh@email.com" autocomplete="email" required>
        </div>
        <div class="modal__grup">
          <label for="daftar-sandi" class="modal__label">Kata Sandi</label>
          <input type="password" id="daftar-sandi" class="modal__input" placeholder="Minimal 8 karakter" autocomplete="new-password" required>
        </div>
        <div class="modal__grup">
          <label for="daftar-lahir" class="modal__label">Tanggal Lahir</label>
          <input type="date" id="daftar-lahir" class="modal__input" required>
        </div>
        <button type="submit" class="modal__tombol">Daftar</button>
      </form>
    </div>
  </div>

  <!-- JS -->
  <script src="/js/utilitas/i18n.js"></script>
  <script src="/js/komponen/bilah-atas.js"></script>
  <script src="/js/komponen/navigasi.js"></script>
  <script src="/js/komponen/menu-samping.js"></script>
  <script src="/js/komponen/pencarian.js"></script>
  <script src="/js/komponen/preferensi.js"></script>
  <script src="/js/aplikasi.js"></script>
  <script>
    /* Akun page specific JS */
    document.addEventListener('DOMContentLoaded', () => {
      // Tab switching
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

      // Filter buttons
      const filters = document.querySelectorAll('.akun__filter');
      filters.forEach((btn) => {
        btn.addEventListener('click', () => {
          filters.forEach((f) => f.classList.remove('aktif'));
          btn.classList.add('aktif');
        });
      });

      // Modal management
      function bukaModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.add('aktif');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('tidak-gulir');
        const firstInput = modal.querySelector('input');
        requestAnimationFrame(() => firstInput?.focus());
      }

      function tutupModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('aktif');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('tidak-gulir');
      }

      document.getElementById('tombol-buka-masuk')?.addEventListener('click', () => bukaModal('modal-masuk'));
      document.getElementById('tombol-buka-daftar')?.addEventListener('click', () => bukaModal('modal-daftar'));

      // Close buttons
      document.querySelectorAll('[data-tutup]').forEach((btn) => {
        btn.addEventListener('click', () => tutupModal(btn.dataset.tutup));
      });

      // Click overlay to close
      document.querySelectorAll('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) tutupModal(overlay.id);
        });
      });

      // Escape to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.modal-overlay.aktif').forEach((m) => tutupModal(m.id));
        }
      });

      // Prevent form submission (prototype)
      document.querySelectorAll('.modal form').forEach((form) => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const parentOverlay = form.closest('.modal-overlay');
          if (parentOverlay) tutupModal(parentOverlay.id);
        });
      });
    });
  </script>
</body>
</html>
