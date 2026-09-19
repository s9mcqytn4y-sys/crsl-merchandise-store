<?php
/**
 * CRSL Merchandise Store - Halaman Detail Bundle
 * Standard /antislop-ui, /antislop-code, /baseline-ui, /007
 * Rules: Customer WAJIB membeli 1 set bundle lengkap
 */

use CRSL\BasisData\PengelolaDatabase;

$slug = $bundleSlug ?? 'back-to-school-with-miflo';

$bundleData = [
  'back-to-school-with-miflo' => [
    'id' => 3516,
    'judul' => 'BACK TO SCHOOL with Miflo',
    'slug' => 'back-to-school-with-miflo',
    'harga_paket' => 289000,
    'harga_asli' => 343100,
    'diskon_persen' => 15,
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
    'diskon_persen' => 16,
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
        'gambar' => '/aset/gambar/ropy-keychain-thumb.webp',
        'varian' => ['Squad 5 Karakter', 'Duo Besties']
      ]
    ],
    'freebies' => 'Bonus Spesial: 1x Exclusive Hologram Sticker, 1x Keyring Tartan BTS 2026.'
  ]
];

$bundle = $bundleData[$slug] ?? $bundleData['back-to-school-with-miflo'];

// Ambil produk rekomendasi dari database
$produkRekomendasi = [];
try {
  $pdo = PengelolaDatabase::ambilKoneksi();
  $stmt = $pdo->query("SELECT id, nama, slug, harga, harga_diskon, gambar_utama, tipe_produk FROM produk ORDER BY id ASC LIMIT 6");
  $produkRekomendasi = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (\Exception $e) {
  $produkRekomendasi = [];
}
?>
<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($bundle['judul']) ?> - CRSL Official Store</title>
  <meta name="description" content="<?= htmlspecialchars($bundle['judul']) ?> paket bundle hemat resmi CRSL.">

  <!-- Open Graph -->
  <meta property="og:title" content="<?= htmlspecialchars($bundle['judul']) ?> - CRSL">
  <meta property="og:image" content="<?= htmlspecialchars($bundle['gambar_utama']) ?>">
  <meta property="og:type" content="product.group">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/aset/ikon/favicon.svg">

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
  <link rel="stylesheet" href="/css/komponen/footer.css">
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
      <li class="menu-samping__item"><a href="/products" class="menu-samping__tautan">All Products <span class="menu-samping__emoji">&#x1F6CD;&#xFE0F;</span></a></li>
      <li class="menu-samping__item"><a href="/bundles/3516/back-to-school-with-miflo" class="menu-samping__tautan">BTS Collection <span class="menu-samping__emoji">&#x1F392;</span></a></li>
      <li class="menu-samping__item"><a href="/#pre-order" class="menu-samping__tautan menu-samping__tautan--promo">Pre-Order Now <span class="menu-samping__emoji">&#x1F525;</span></a></li>
      <li class="menu-samping__item"><a href="/kategori/backpack-collection" class="menu-samping__tautan">Backpacks</a></li>
      <li class="menu-samping__item"><a href="/kategori/slingbag-collection" class="menu-samping__tautan">Slingbags</a></li>
      <li class="menu-samping__item"><a href="/kategori/tumbler-collection" class="menu-samping__tautan">Tumbler Collection</a></li>
      <li class="menu-samping__item"><a href="/kategori/wallet-accessories" class="menu-samping__tautan">Wallet &amp; Accessories</a></li>
    </ul>
  </nav>

  <?php require_once PUBLIK_DIR . '/komponen/pencarian.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/preferensi.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/keranjang.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/cta-mengambang.php'; ?>
  <?php require_once PUBLIK_DIR . '/komponen/modal-otentikasi.php'; ?>

  <!-- Main Bundle Detail Content (Arsitektur Konsisten dengan PDP) -->
  <main class="bundle-pdp" id="konten-utama">
    <div class="bundle-pdp__wadah">
      
      <!-- Breadcrumb Navigation -->
      <nav class="bundle-pdp__breadcrumb" aria-label="Jejak navigasi">
        <ol class="bundle-pdp__breadcrumb-list">
          <li class="bundle-pdp__breadcrumb-item"><a href="/">Home</a></li>
          <li class="bundle-pdp__breadcrumb-pemisah" aria-hidden="true">/</li>
          <li class="bundle-pdp__breadcrumb-item"><a href="/#bundles">Bundles</a></li>
          <li class="bundle-pdp__breadcrumb-pemisah" aria-hidden="true">/</li>
          <li class="bundle-pdp__breadcrumb-item active" aria-current="page"><?= htmlspecialchars($bundle['judul']) ?></li>
        </ol>
      </nav>

      <!-- Grid Anatomi 3-Kolom Bundle PDP -->
      <div class="bundle-pdp__grid-tiga-kolom">
        
        <!-- KOLOM 1: Galeri Thumbnail Vertikal -->
        <aside class="bundle-pdp__kolom-thumbnail" aria-label="Daftar Foto Bundle">
          <div class="bundle-pdp__thumbnail-vertikal" role="tablist">
            <?php foreach ($bundle['galeri'] as $idx => $gbr): ?>
              <button
                type="button"
                class="bundle-pdp__thumb-btn <?= $idx === 0 ? 'aktif' : '' ?>"
                data-index="<?= $idx ?>"
                data-url="<?= htmlspecialchars($gbr) ?>"
                role="tab"
                aria-selected="<?= $idx === 0 ? 'true' : 'false' ?>"
                aria-label="Foto bundle <?= $idx + 1 ?>"
              >
                <img src="<?= htmlspecialchars($gbr) ?>" alt="Thumbnail <?= $idx + 1 ?>" loading="lazy" width="70" height="70">
              </button>
            <?php endforeach; ?>
          </div>
        </aside>

        <!-- KOLOM 2: Gambar Utama Fokus Interaktif -->
        <section class="bundle-pdp__kolom-utama" aria-label="Tampilan Gambar Bundle">
          <div class="bundle-pdp__viewport-zoom" id="bundle-zoom-viewport">
            <div class="bundle-pdp__gambar-badges">
              <span class="bundle-pdp__badge-tipe">Bundled Product</span>
              <span class="bundle-pdp__badge-kategori">BTS Collection</span>
              <span class="bundle-pdp__badge-diskon"><?= $bundle['diskon_persen'] ?>% OFF</span>
            </div>
            <img
              id="bundle-gambar-utama"
              src="<?= htmlspecialchars($bundle['gambar_utama']) ?>"
              alt="<?= htmlspecialchars($bundle['judul']) ?>"
              class="bundle-pdp__gambar-fokus"
              loading="eager"
            >
          </div>
        </section>

        <!-- KOLOM 3: Anatomi Informasi, Pilihan Varian Item, dan Aksi -->
        <section class="bundle-pdp__kolom-aksi" aria-label="Informasi dan Pembelian Bundle">
          
          <!-- Judul Bundle -->
          <h1 class="bundle-pdp__judul"><?= htmlspecialchars($bundle['judul']) ?></h1>

          <!-- Harga Paket & Tag Pill -->
          <div class="bundle-pdp__harga-row">
            <span class="bundle-pdp__harga-paket">Rp <?= number_format($bundle['harga_paket'], 0, ',', '.') ?></span>
            <span class="bundle-pdp__tag-bundled">Bundled Product, Rp <?= number_format($bundle['harga_paket'], 0, ',', '.') ?></span>
          </div>

          <!-- Highlight Promo & Value Proposition (Screenshot 2) -->
          <div class="bundle-pdp__deskripsi-box">
            <div class="bundle-pdp__desc-item">
              <span class="bundle-pdp__emoji-icon" aria-hidden="true">🛍️</span>
              <div>
                <strong><?= htmlspecialchars($bundle['judul']) ?></strong>
                <p>Make your school days even cuter with Miflo Mini Backpack! ❤️</p>
              </div>
            </div>

            <div class="bundle-pdp__desc-item">
              <span class="bundle-pdp__emoji-icon" aria-hidden="true">🎁</span>
              <div>
                <strong>Special BTS Offer</strong>
                <p>Get a <strong>FREE Ropy Keychain</strong> with every purchase of Miflo Mini Backpack. The perfect duo to complete your everyday look. ✨ <em>Limited stock. While supplies last.</em></p>
              </div>
            </div>
          </div>

          <!-- Subtitle & Caveat Rule (Screenshot 2) -->
          <div class="bundle-pdp__section-pilih-header">
            <h2 class="bundle-pdp__subjudul">Pick one product from each section</h2>
            <p class="bundle-pdp__caveat">Products that are in waiting list or out of stock can't be ordered together with other products.</p>
          </div>

          <!-- Daftar Item dalam Bundle -->
          <div class="bundle-pdp__daftar-item" id="bundle-items-list" data-total-items="<?= count($bundle['items']) ?>" data-bundle-nama="<?= htmlspecialchars($bundle['judul']) ?>" data-bundle-harga="<?= $bundle['harga_paket'] ?>" data-bundle-gambar="<?= htmlspecialchars($bundle['gambar_utama']) ?>">
            <?php foreach ($bundle['items'] as $idx => $item): ?>
              <div class="bundle-item-kartu terpilih" data-item-index="<?= $idx ?>" data-item-id="<?= $item['id'] ?>" data-item-nama="<?= htmlspecialchars($item['nama']) ?>">
                <div class="bundle-item-kartu__header">PRODUCT <?= $idx + 1 ?></div>
                <div class="bundle-item-kartu__body">
                  <img src="<?= htmlspecialchars($item['gambar']) ?>" alt="<?= htmlspecialchars($item['nama']) ?>" class="bundle-item-kartu__thumb" width="56" height="56" loading="lazy">
                  <div class="bundle-item-kartu__detail">
                    <div class="bundle-item-kartu__nama"><?= htmlspecialchars($item['nama']) ?></div>
                    <div class="bundle-item-kartu__harga">Rp <?= number_format($item['harga'], 0, ',', '.') ?></div>
                  </div>
                  <div class="bundle-item-kartu__aksi-group">
                    <span class="bundle-item-kartu__chevron">&rsaquo;</span>
                    <span class="bundle-item-kartu__check-icon" aria-label="Item terpilih">✓</span>
                  </div>
                </div>

                <!-- Pilihan Varian Pill (Brown Plaid merah, dst - Screenshot 2 & 3) -->
                <div class="bundle-item-kartu__varian-box">
                  <span class="bundle-item-kartu__varian-label">Pilih Varian:</span>
                  <div class="bundle-item-kartu__varian-list" role="radiogroup">
                    <?php foreach ($item['varian'] as $vIdx => $v): ?>
                      <button 
                        type="button" 
                        class="bundle-item-kartu__varian-pill <?= $vIdx === 0 ? 'aktif' : '' ?>"
                        data-varian="<?= htmlspecialchars($v) ?>"
                        role="radio"
                        aria-checked="<?= $vIdx === 0 ? 'true' : 'false' ?>"
                      >
                        <?= htmlspecialchars($v) ?>
                      </button>
                    <?php endforeach; ?>
                  </div>
                </div>
              </div>
            <?php endforeach; ?>
          </div>

          <!-- Section Delivery Kontainer (Screenshot 4) -->
          <div class="bundle-pdp__sec-delivery">
            <h2 class="bundle-pdp__delivery-title">Delivery</h2>
            <div class="bundle-pdp__delivery-table">
              <div class="bundle-pdp__delivery-row">
                <span class="bundle-pdp__delivery-label">Deliver to:</span>
                <span class="bundle-pdp__delivery-val">Jakarta Pusat, Johar Baru ▾</span>
              </div>
              <div class="bundle-pdp__delivery-row bundle-pdp__delivery-row--cost">
                <span class="bundle-pdp__delivery-label">Estimated Delivery Cost:</span>
                <div class="bundle-pdp__delivery-cost-wrap">
                  <button type="button" class="bundle-pdp__delivery-btn-cost" id="bundle-btn-cek-ongkir" aria-haspopup="dialog" aria-expanded="false">
                    <span id="bundle-teks-ongkir">Rp 16,000</span>
                    <span class="bundle-pdp__ikon-info" aria-label="Rincian opsi kurir">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </span>
                  </button>

                  <!-- Popover Kurir (Screenshot 4) -->
                  <div class="bundle-pdp__popover-kurir" id="bundle-popover-kurir" style="display: none;">
                    <div class="bundle-pdp__popover-kurir-header">
                      <span>Opsi Kurir Pengiriman</span>
                      <button type="button" id="bundle-btn-tutup-kurir" aria-label="Tutup popover">&times;</button>
                    </div>
                    <div class="bundle-pdp__popover-kurir-list">
                      <div class="bundle-pdp__kurir-card aktif">
                        <div class="bundle-pdp__kurir-logo-col">
                          <img src="/aset/ikon/kurir-jne.svg" alt="JNE" width="64" height="24" loading="lazy">
                        </div>
                        <div class="bundle-pdp__kurir-info-col">
                          <div class="bundle-pdp__kurir-nominal">Rp 16,000</div>
                          <div class="bundle-pdp__kurir-layanan">(Reguler) 2-3 Days</div>
                        </div>
                      </div>
                      <div class="bundle-pdp__kurir-card">
                        <div class="bundle-pdp__kurir-logo-col">
                          <img src="/aset/ikon/kurir-jne.svg" alt="JNE" width="64" height="24" loading="lazy">
                        </div>
                        <div class="bundle-pdp__kurir-info-col">
                          <div class="bundle-pdp__kurir-nominal">Rp 39,000</div>
                          <div class="bundle-pdp__kurir-layanan">(YES (Yakin Esok Sampai)) 1 Days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bundle-pdp__delivery-row">
                <span class="bundle-pdp__delivery-label">Weight:</span>
                <span class="bundle-pdp__delivery-val">800g</span>
              </div>
            </div>
            <div class="bundle-pdp__delivery-footnote">
              <p>Shipped within 24 hours,</p>
              <p>(Upon confirmation of payment)</p>
            </div>
          </div>

          <!-- Section Message CRSL Button (Screenshot 5) -->
          <div class="bundle-pdp__sec-pesan">
            <button type="button" class="bundle-pdp__btn-pesan" id="bundle-btn-pesan-crsl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
              <span>Message CRSL?</span>
            </button>
          </div>

          <!-- Tombol CTA Dinamis (Screenshot 3) -->
          <button type="button" id="bundle-cta-btn" class="bundle-pdp__tombol-cta bundle-pdp__tombol-cta--aktif">
            <span id="bundle-cta-teks">Add Bundle to Cart - Rp <?= number_format($bundle['harga_paket'], 0, ',', '.') ?></span>
          </button>
        </section>
      </div>

      <!-- ========== YOU MIGHT ALSO LIKE ROW ========== -->
      <?php if (!empty($produkRekomendasi)): ?>
        <section class="bundle-pdp__rekomendasi" aria-labelledby="judul-rekomendasi">
          <div class="bundle-pdp__rekomendasi-header">
            <h2 id="judul-rekomendasi" class="bundle-pdp__rekomendasi-judul">You Might Also Like</h2>
            <div class="bundle-pdp__carousel-nav">
              <button type="button" class="bundle-pdp__nav-btn" id="bundle-rekomendasi-prev" aria-label="Geser rekomendasi ke kiri">&lsaquo;</button>
              <button type="button" class="bundle-pdp__nav-btn" id="bundle-rekomendasi-next" aria-label="Geser rekomendasi ke kanan">&rsaquo;</button>
            </div>
          </div>
          <div class="bundle-pdp__carousel-track" id="bundle-rekomendasi-track">
            <?php foreach ($produkRekomendasi as $pRek): ?>
              <?php 
                $pHarga = $pRek['harga_diskon'] ?: $pRek['harga'];
                $pDiskon = $pRek['harga_diskon'] && $pRek['harga_diskon'] < $pRek['harga'];
              ?>
              <article class="bundle-pdp__card-katalog">
                <a href="/produk/<?= htmlspecialchars($pRek['slug']) ?>" class="bundle-pdp__card-media">
                  <img src="<?= htmlspecialchars($pRek['gambar_utama']) ?>" alt="<?= htmlspecialchars($pRek['nama']) ?>" loading="lazy" width="220" height="220">
                  <?php if ($pDiskon): ?>
                    <span class="bundle-pdp__card-badge-diskon"><?= round((1 - $pRek['harga_diskon'] / $pRek['harga']) * 100) ?>% OFF</span>
                  <?php endif; ?>
                </a>
                <div class="bundle-pdp__card-info">
                  <h3 class="bundle-pdp__card-nama">
                    <a href="/produk/<?= htmlspecialchars($pRek['slug']) ?>"><?= htmlspecialchars($pRek['nama']) ?></a>
                  </h3>
                  <div class="bundle-pdp__card-harga">
                    <span class="bundle-pdp__card-harga-aktif">Rp <?= number_format($pHarga, 0, ',', '.') ?></span>
                    <?php if ($pDiskon): ?>
                      <span class="bundle-pdp__card-harga-coret">Rp <?= number_format($pRek['harga'], 0, ',', '.') ?></span>
                    <?php endif; ?>
                  </div>
                </div>
              </article>
            <?php endforeach; ?>
          </div>
        </section>
      <?php endif; ?>

    </div>

    <!-- Modal Message CRSL (Screenshot 5) -->
    <div class="modal-pesan-overlay" id="bundle-modal-pesan-overlay" style="display:none;" aria-hidden="true">
      <div class="modal-pesan-card" role="dialog" aria-modal="true" aria-labelledby="bundle-modal-pesan-judul">
        <div class="modal-pesan-header">
          <div class="modal-pesan-produk-info">
            <img src="<?= htmlspecialchars($bundle['gambar_utama']) ?>" alt="<?= htmlspecialchars($bundle['judul']) ?>" class="modal-pesan-thumb" width="46" height="46">
            <div class="modal-pesan-produk-teks">
              <h4 class="modal-pesan-produk-nama"><?= htmlspecialchars($bundle['judul']) ?></h4>
              <span class="modal-pesan-produk-harga">Rp <?= number_format($bundle['harga_paket'], 0, ',', '.') ?></span>
            </div>
          </div>
          <button type="button" class="modal-pesan-close" id="bundle-btn-close-pesan" aria-label="Tutup modal pesan">✕</button>
        </div>
        <div class="modal-pesan-body">
          <div class="modal-pesan-instruksi">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h3 id="bundle-modal-pesan-judul" class="modal-pesan-judul-teks">What would you like to ask about this product?</h3>
          </div>
          <div class="modal-pesan-form">
            <textarea id="bundle-pesan-crsl-input" class="modal-pesan-textarea" placeholder="Type Message" rows="4"></textarea>
            <button type="button" id="bundle-pesan-crsl-kirim" class="modal-pesan-btn-send" disabled>Send</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div id="bundle-toast" class="bundle-toast" role="alert" aria-live="polite"></div>

  </main>

  <!-- ========== FOOTER ========== -->
  <?php require PUBLIK_DIR . '/komponen/footer.php'; ?>

  <!-- Sticky Bottom Action Bar Khusus Mobile -->
  <div class="bundle-pdp__mobile-bar" aria-label="Beli bundle cepat">
    <div class="bundle-pdp__mobile-harga">
      <span class="bundle-pdp__mobile-harga-label">Total Bundle:</span>
      <span class="bundle-pdp__mobile-harga-nilai">Rp <?= number_format($bundle['harga_paket'], 0, ',', '.') ?></span>
    </div>
    <button type="button" class="bundle-pdp__mobile-btn-buy" id="bundle-mobile-btn-buy">Add Bundle to Cart</button>
  </div>

  <!-- JS Scripts -->
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
