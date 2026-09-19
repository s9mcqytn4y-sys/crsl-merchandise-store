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
  <link rel="stylesheet" href="/css/halaman/akun.css">
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

  <!-- ========== OVERLAY PENCARIAN ========== -->
  <?php require __DIR__ . '/../komponen/pencarian.php'; ?>

  <!-- ========== MODAL PREFERENSI ========== -->
  <?php require __DIR__ . '/../komponen/preferensi.php'; ?>

  <!-- ========== MODAL & DRAWER KERANJANG ========== -->
  <?php require __DIR__ . '/../komponen/keranjang.php'; ?>

  <!-- ========== STICKY CTA ========== -->
  <?php require __DIR__ . '/../komponen/cta-mengambang.php'; ?>

  <!-- ========== MODAL OTENTIKASI & VERIFIKASI ========== -->
  <?php require __DIR__ . '/../komponen/modal-otentikasi.php'; ?>

  <!-- ========== KONTEN UTAMA: AKUN (Screenshot 3 & 4) ========== -->
  <main id="konten-utama">
    <div class="akun-container">

      <!-- Header Profil: Hi [Nama] + Tombol Reseller & Settings -->
      <header class="akun-header">
        <h1 class="akun-header__salam" id="akun-header-salam">Hi abdul music</h1>
        <div class="akun-header__aksi">
          <button type="button" class="akun-btn-pill" id="btn-become-reseller">Become Reseller</button>
          <button type="button" class="akun-btn-pill" id="btn-account-settings">Settings</button>
        </div>
      </header>

      <!-- 2 Kartu Ringkasan (Loyalty & My Vouchers) (Screenshot 3) -->
      <section class="akun-cards-grid" aria-label="Ringkasan akun">
        
        <!-- Card Loyalty -->
        <div class="akun-summary-card">
          <div class="akun-summary-card__top">
            <h2 class="akun-summary-card__judul">Loyalty</h2>
            <button type="button" class="akun-summary-card__link" id="btn-see-loyalty-details">See Details</button>
          </div>
          <div class="akun-summary-card__body">
            <div class="akun-icon-circle" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
            </div>
            <div class="akun-summary-card__info">
              <div class="akun-summary-card__status">Non-Member</div>
              <div class="akun-summary-card__sub">Spend Rp 200,000 more to reach New Freen</div>
            </div>
          </div>
        </div>

        <!-- Card My Vouchers -->
        <div class="akun-summary-card">
          <div class="akun-summary-card__top">
            <h2 class="akun-summary-card__judul">My Vouchers</h2>
          </div>
          <div class="akun-summary-card__body" style="justify-content: center; text-align: center; flex-direction: column; gap: 4px; padding-block: 6px;">
            <svg width="34" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
              <line x1="12" y1="5" x2="12" y2="19" stroke-dasharray="2 2"/>
            </svg>
            <div class="akun-summary-card__status" style="font-size: 13.5px; color: #4b5563;">No vouchers available</div>
            <div class="akun-summary-card__sub" style="font-size: 11.5px;">You don't have any vouchers at the moment</div>
          </div>
        </div>

      </section>

      <!-- Tabs Navigation (Orders | Wishlist) (Screenshot 3) -->
      <div class="akun-tabs-nav" role="tablist" aria-label="Pilihan tampilan akun">
        <ul class="akun-tabs-list">
          <li style="flex: 1;">
            <button type="button" class="akun-tab-btn aktif" role="tab" aria-selected="true" aria-controls="panel-pesanan" id="tab-pesanan">Orders</button>
          </li>
          <li style="flex: 1;">
            <button type="button" class="akun-tab-btn" role="tab" aria-selected="false" aria-controls="panel-wishlist" id="tab-wishlist">Wishlist</button>
          </li>
        </ul>
      </div>

      <!-- Tab Panel 1: Orders (Screenshot 3) -->
      <section id="panel-pesanan" role="tabpanel" aria-labelledby="tab-pesanan">
        <div class="akun-orders-subnav">
          <div class="akun-orders-count" id="akun-orders-count">My Orders (1)</div>
          <div class="akun-orders-controls">
            <a href="#cari-pesanan" class="akun-orders-find-link" onclick="const q=prompt('Masukkan Nomor Pesanan Anda:'); if(q){alert('Mencari pesanan: '+q);} return false;">Find your Orders</a>
            <select class="akun-orders-status-select" id="akun-orders-status-select" aria-label="Filter status pesanan">
              <option value="all">All status</option>
              <option value="unpaid">Unpaid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <!-- Order items container rendered dynamically via akun.js -->
        <div id="akun-orders-list"></div>
      </section>

      <!-- Tab Panel 2: Wishlist -->
      <section id="panel-wishlist" role="tabpanel" aria-labelledby="tab-wishlist" style="display: none;">
        <div id="akun-wishlist-kosong" style="text-align: center; padding: 3rem 1rem; border: 1px dashed #e5e7eb; border-radius: 12px; background: #fafafa; display: flex; flex-direction: column; align-items: center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.75rem;" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <div style="font-weight: 600; color: #374151; font-size: 15px; margin-bottom: 4px;">Your Wishlist is Empty</div>
          <div style="color: #9ca3af; font-size: 13px;">Explore our products and save your favorites here.</div>
        </div>
        <div id="akun-daftar-wishlist"></div>
      </section>

    </div>
  </main>

  <!-- ========== MODAL LOYALTY (Screenshot 4) ========== -->
  <div id="modal-loyalty-overlay" class="modal-loyalty-overlay" role="dialog" aria-modal="true" aria-labelledby="loyalty-modal-title">
    <div class="modal-loyalty-card">
      <div class="modal-loyalty-header">
        <button type="button" class="modal-loyalty-btn-back" id="btn-close-loyalty" aria-label="Kembali">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 class="modal-loyalty-title" id="loyalty-modal-title">Loyalty</h2>
      </div>
      <div class="modal-loyalty-body">
        
        <!-- Status Member Atas -->
        <div class="modal-loyalty-status-top">
          <div class="modal-loyalty-gift-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          </div>
          <div class="modal-loyalty-tier-name">Non-Member</div>
          <div class="modal-loyalty-tier-desc">Spend Rp 200,000 more to reach New Freen</div>
          
          <!-- Progress Bar dengan Diamond Icon -->
          <div class="modal-loyalty-progress-box">
            <div class="modal-loyalty-progress-track">
              <div class="modal-loyalty-progress-fill" style="width: 0%;"></div>
            </div>
            <div class="modal-loyalty-progress-meta">
              <span>Rp 0 / Rp 200,000</span>
              <svg class="modal-loyalty-diamond-icon" viewBox="0 0 24 24" fill="#3b82f6" aria-hidden="true">
                <path d="M6 3h12l4 6-10 12L2 9l4-6z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Section Loyalty Tiers -->
        <div class="modal-loyalty-section-title">Loyalty Tiers</div>

        <!-- Tier 1: New Freen -->
        <div class="modal-loyalty-tier-card">
          <div class="modal-loyalty-tier-badge-col">
            <div class="modal-loyalty-tier-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#60a5fa" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/></svg>
            </div>
            <div class="modal-loyalty-tier-title">New Freen</div>
            <div class="modal-loyalty-tier-spend">Spend Rp 200,000/1 months</div>
          </div>
          <ul class="modal-loyalty-tier-benefits">
            <li>1,000 points welcome bonus</li>
            <li>200 points/review</li>
          </ul>
        </div>

        <!-- Tier 2: Bestfreen -->
        <div class="modal-loyalty-tier-card">
          <div class="modal-loyalty-tier-badge-col">
            <div class="modal-loyalty-tier-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/></svg>
            </div>
            <div class="modal-loyalty-tier-title">Bestfreen</div>
            <div class="modal-loyalty-tier-spend">Spend Rp 500,000/3 months</div>
          </div>
          <ul class="modal-loyalty-tier-benefits">
            <li>2,000 points welcome bonus</li>
            <li>200 points/review</li>
          </ul>
        </div>

        <!-- Tier 3: CRSL Gengs -->
        <div class="modal-loyalty-tier-card">
          <div class="modal-loyalty-tier-badge-col">
            <div class="modal-loyalty-tier-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#8b5cf6" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/></svg>
            </div>
            <div class="modal-loyalty-tier-title">CRSL Gengs</div>
            <div class="modal-loyalty-tier-spend">Spend Rp 1.500.000/3 months</div>
          </div>
          <ul class="modal-loyalty-tier-benefits">
            <li>50,000 points welcome bonus</li>
            <li>1,000 points/review</li>
          </ul>
        </div>

        <!-- Tombol Bawah: See Loyalty Terms -->
        <div class="modal-loyalty-footer">
          <button type="button" class="modal-loyalty-terms-link" id="btn-see-loyalty-terms">See Loyalty Terms</button>
        </div>

      </div>
    </div>
  </div>

  <!-- ========== MODAL LOYALTY TERMS ========== -->
  <div id="modal-terms-overlay" class="modal-terms-overlay" role="dialog" aria-modal="true" aria-labelledby="terms-title">
    <div class="modal-terms-card">
      <div class="modal-terms-header">
        <h3 class="modal-terms-title" id="terms-title">Loyalty terms</h3>
        <button type="button" class="modal-terms-close" id="btn-close-terms" aria-label="Tutup">✕</button>
      </div>
      <div class="modal-terms-body">
        <p>1. Your loyalty tier will be determined by the total value of your purchases within a specific evaluation period.</p>
        <p>2. CRSL reserves the right to change the terms, conditions, benefits, or structure of this program at any time without prior notice.</p>
        <p>3. Any updates will take effect immediately once published by CRSL. For questions or concerns, please contact CRSL.</p>
      </div>
    </div>
  </div>

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
  <script src="/js/halaman/akun.js"></script>
  <script src="/js/aplikasi.js"></script>
</body>
</html>
