<?php
/**
 * CRSL Merchandise Store - Halaman Detail Bundle
 * Rules: Customer WAJIB membeli 1 set bundle lengkap
 */

$slug = $bundleSlug ?? 'back-to-school-with-miflo';

$bundleData = [
  'back-to-school-with-miflo' => [
    'id' => 3516,
    'judul' => 'BACK TO SCHOOL with Miflo',
    'slug' => 'back-to-school-with-miflo',
    'harga_paket' => 289000,
    'harga_asli' => 343100,
    'hemat' => 'Hemat Rp 54.100 (15% OFF)',
    'gambar_utama' => '/aset/gambar/bundle-miflo-cover.webp',
    'galeri' => [
      '/aset/gambar/bundle-miflo-cover.webp',
      '/aset/gambar/bundle-miflo-freebies.webp'
    ],
    'items' => [
      [
        'id' => 101,
        'nama' => 'CRSL Miflo Mini Backpack | Tas Gendong Canvas Wanita',
        'harga' => 299000,
        'gambar' => '/aset/gambar/miflo-backpack-thumb.webp',
        'varian' => ['Pink Pastel', 'Black Charcoal', 'Sage Green']
      ],
      [
        'id' => 102,
        'nama' => 'CRSL Ropy Colorful Keychain | Aksesoris Gantungan Kunci',
        'harga' => 44100,
        'gambar' => '/aset/gambar/ropy-keychain-thumb.webp',
        'varian' => ['Chilo Pink', 'Odin Green', 'Choco Brown']
      ]
    ],
    'freebies' => 'Bonus Spesial: 1x Exclusive Sticker Pack BTS 2026, 1x Character Enamel Pin, 1x Authenticity Card.'
  ],
  'back-to-school-with-haru' => [
    'id' => 2188,
    'judul' => 'BACK TO SCHOOL WITH HARU!',
    'slug' => 'back-to-school-with-haru',
    'harga_paket' => 329000,
    'harga_asli' => 395000,
    'hemat' => 'Hemat Rp 66.000 (16% OFF)',
    'gambar_utama' => '/aset/gambar/bundle-haru-cover.webp',
    'galeri' => [
      '/aset/gambar/bundle-haru-cover.webp',
      '/aset/gambar/bundle-haru-freebies.webp'
    ],
    'items' => [
      [
        'id' => 201,
        'nama' => 'CRSL Haru Tartan Plaid Backpack | Tas Sekolah Premium',
        'harga' => 345000,
        'gambar' => '/aset/gambar/bundle-haru-cover.webp',
        'varian' => ['Brown Plaid', 'Blue Plaid', 'Grey Tartan']
      ],
      [
        'id' => 202,
        'nama' => 'CRSL Character Pin Badge Set | 5 Karakter Enamel',
        'harga' => 50000,
        'gambar' => '/aset/gambar/banner-bts.webp',
        'varian' => ['Squad 5 Karakter', 'Duo Besties']
      ]
    ],
    'freebies' => 'Bonus Spesial: 1x Exclusive Hologram Sticker, 1x Keyring Tartan BTS 2026.'
  ]
];

$bundle = $bundleData[$slug] ?? $bundleData['back-to-school-with-miflo'];
?>
<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($bundle['judul']) ?> - CRSL</title>
  <meta name="description" content="<?= htmlspecialchars($bundle['judul']) ?> paket bundle hemat resmi CRSL.">

  <!-- Open Graph -->
  <meta property="og:title" content="<?= htmlspecialchars($bundle['judul']) ?> - CRSL">
  <meta property="og:image" content="<?= htmlspecialchars($bundle['gambar_utama']) ?>">
  <meta property="og:type" content="product.group">

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
  <link rel="stylesheet" href="/css/halaman/bundle-detail.css">
</head>
<body>
  <!-- Bilah Atas -->
  <div class="bilah-atas" role="region" aria-label="Pengumuman promo">
    <div class="bilah-atas__rotator"></div>
  </div>

  <!-- Navigasi -->
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
          <span class="navigasi__bendera">🇮🇩</span><span class="navigasi__mata-uang-label">IDR</span>
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

  <!-- Menu Samping, Pencarian, Preferensi, Keranjang, Floating CTAs -->
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
      <li class="menu-samping__item"><a href="/#bundles" class="menu-samping__tautan">BTS Must-Have Bundle <span class="menu-samping__emoji">🎒</span></a></li>
      <li class="menu-samping__item"><a href="/#pre-order" class="menu-samping__tautan menu-samping__tautan--promo">Pre-Order Now <span class="menu-samping__emoji">🔥</span></a></li>
      <li class="menu-samping__item"><a href="/#karakter-crsl" class="menu-samping__tautan">Karakter CRSL <span class="menu-samping__emoji">🐾</span></a></li>
      <li class="menu-samping__item"><a href="/#produk-unggulan" class="menu-samping__tautan">Katalog Produk <span class="menu-samping__emoji">✨</span></a></li>
    </ul>
  </nav>

  <?php require_once PUBLIK_DIR . '/komponen/pencarian.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/preferensi.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/keranjang.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/cta-mengambang.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/modal-otentikasi.php'; ?>

  <!-- Main Bundle Detail Content -->
  <main class="bundle-pdp" id="konten-utama">
    <div class="bundle-pdp__wadah">
      <!-- Breadcrumb -->
      <nav class="bundle-pdp__breadcrumb" aria-label="Jejak navigasi">
        <a href="/">Beranda</a>
        <span class="bundle-pdp__breadcrumb-pemisah">/</span>
        <a href="/#bundles">Bundles</a>
        <span class="bundle-pdp__breadcrumb-pemisah">/</span>
        <span aria-current="page"><?= htmlspecialchars($bundle['judul']) ?></span>
      </nav>

      <div class="bundle-pdp__grid">
        <!-- Kolom Kiri: Galeri Foto -->
        <div class="bundle-pdp__galeri">
          <div class="bundle-pdp__gambar-utama-wadah">
            <img 
              id="bundle-gambar-utama"
              src="<?= htmlspecialchars($bundle['gambar_utama']) ?>" 
              alt="<?= htmlspecialchars($bundle['judul']) ?>" 
              class="bundle-pdp__gambar-utama"
            >
          </div>
          <div class="bundle-pdp__thumbnails">
            <?php foreach ($bundle['galeri'] as $index => $gbr): ?>
              <button 
                type="button" 
                class="bundle-pdp__thumb-btn <?= $index === 0 ? 'bundle-pdp__thumb-btn--aktif' : '' ?>"
                data-src="<?= htmlspecialchars($gbr) ?>"
                aria-label="Lihat foto galeri <?= $index + 1 ?>"
              >
                <img src="<?= htmlspecialchars($gbr) ?>" alt="Thumbnail <?= $index + 1 ?>" class="bundle-pdp__thumb-img">
              </button>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Kolom Kanan: Informasi & Pemilihan Varian Item -->
        <div class="bundle-pdp__info">
          <h1 class="bundle-pdp__judul"><?= htmlspecialchars($bundle['judul']) ?></h1>
          
          <div class="bundle-pdp__harga-box">
            <span class="bundle-pdp__harga-paket">Rp <?= number_format($bundle['harga_paket'], 0, ',', '.') ?></span>
            <span class="bundle-pdp__harga-asli">Rp <?= number_format($bundle['harga_asli'], 0, ',', '.') ?></span>
            <span class="bundle-pdp__hemat-tag"><?= htmlspecialchars($bundle['hemat']) ?></span>
          </div>

          <!-- Peringatan Aturan Bundle -->
          <div class="bundle-pdp__peringatan">
            <strong>Aturan Paket:</strong> Products that are in waiting list or out of stock can't be ordered together with other products. Pelanggan wajib memilih 1 varian untuk setiap produk di dalam bundle.
          </div>

          <p style="font-size: 0.85rem; color: #10b981; font-weight: 600;">
            ✓ <?= htmlspecialchars($bundle['freebies']) ?>
          </p>

          <!-- Daftar Item dalam Bundle -->
          <div class="bundle-pdp__daftar-item" id="bundle-items-list" data-total-items="<?= count($bundle['items']) ?>" data-bundle-nama="<?= htmlspecialchars($bundle['judul']) ?>" data-bundle-harga="<?= $bundle['harga_paket'] ?>" data-bundle-gambar="<?= htmlspecialchars($bundle['gambar_utama']) ?>">
            <?php foreach ($bundle['items'] as $idx => $item): ?>
              <div class="bundle-item-kartu" data-item-index="<?= $idx ?>" data-item-id="<?= $item['id'] ?>" data-item-nama="<?= htmlspecialchars($item['nama']) ?>">
                <div class="bundle-item-kartu__header">Product <?= $idx + 1 ?></div>
                <div class="bundle-item-kartu__body">
                  <img src="<?= htmlspecialchars($item['gambar']) ?>" alt="<?= htmlspecialchars($item['nama']) ?>" class="bundle-item-kartu__thumb">
                  <div class="bundle-item-kartu__detail">
                    <div class="bundle-item-kartu__nama"><?= htmlspecialchars($item['nama']) ?></div>
                    <div class="bundle-item-kartu__harga">Rp <?= number_format($item['harga'], 0, ',', '.') ?></div>
                  </div>
                  <button type="button" class="bundle-item-kartu__pilih-btn" aria-label="Pilih opsi untuk <?= htmlspecialchars($item['nama']) ?>" data-action="toggle-item">
                    +
                  </button>
                </div>
                <!-- Pilihan Varian -->
                <div class="bundle-item-kartu__varian-box">
                  <span style="font-size: 0.8rem; font-weight: 700; width: 100%; margin-bottom: 0.25rem;">Pilih Varian:</span>
                  <?php foreach ($item['varian'] as $vIdx => $v): ?>
                    <button 
                      type="button" 
                      class="bundle-item-kartu__varian-pill <?= $vIdx === 0 ? 'bundle-item-kartu__varian-pill--aktif' : '' ?>"
                      data-varian="<?= htmlspecialchars($v) ?>"
                    >
                      <?= htmlspecialchars($v) ?>
                    </button>
                  <?php endforeach; ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>

          <!-- Tombol CTA Dinamis -->
          <button type="button" id="bundle-cta-btn" class="bundle-pdp__tombol-cta bundle-pdp__tombol-cta--aktif">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span id="bundle-cta-teks">Tambah 1 Set Bundle ke Keranjang (Rp <?= number_format($bundle['harga_paket'], 0, ',', '.') ?>)</span>
          </button>
        </div>
      </div>
    </div>
  </main>

  <!-- JS -->
  <script src="/js/utilitas/i18n.js"></script>
  <script src="/js/komponen/bilah-atas.js"></script>
  <script src="/js/komponen/navigasi.js"></script>
  <script src="/js/komponen/menu-samping.js"></script>
  <script src="/js/komponen/pencarian.js"></script>
  <script src="/js/komponen/preferensi.js"></script>
  <script src="/js/komponen/keranjang.js"></script>
  <script src="/js/komponen/cta-mengambang.js"></script>
  <script src="/js/komponen/otentikasi.js"></script>
  <script src="/js/halaman/bundle-detail.js"></script>
  <script src="/js/aplikasi.js"></script>
</body>
</html>
