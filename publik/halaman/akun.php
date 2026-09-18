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
      background-color: var(--warna-primer, #e52027);
      color: #ffffff;
      border: 1px solid var(--warna-primer, #e52027);
    }

    .akun__tombol--signup:hover {
      background-color: var(--warna-primer-hover, #cc1c22);
      border-color: var(--warna-primer-hover, #cc1c22);
      color: #ffffff;
    }

    .akun__tombol--logout {
      background-color: transparent;
      color: var(--warna-error, #f5564a);
      border: 1px solid var(--warna-error, #f5564a);
      font-size: 13px;
      padding: 6px 16px;
      min-height: 36px;
    }

    .akun__tombol--logout:hover {
      background-color: #fff1f2;
    }

    /* Logged in User Card */
    .akun__user-card {
      display: flex;
      align-items: center;
      gap: var(--jarak-md);
      padding: var(--jarak-lg) var(--jarak-xl);
      background-color: var(--warna-latar-sekunder);
      border-radius: var(--radius-lg);
      margin-bottom: var(--jarak-2xl);
      border: 1px solid var(--warna-batas);
      flex-wrap: wrap;
    }

    .akun__user-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background-color: var(--warna-primer, #e52027);
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .akun__user-info {
      flex: 1;
      min-width: 200px;
    }

    .akun__user-nama {
      font-size: 18px;
      font-weight: 700;
      color: var(--warna-teks);
      margin-bottom: 2px;
    }

    .akun__user-email {
      font-size: 13px;
      color: var(--warna-teks-sekunder);
      margin-bottom: 6px;
    }

    .akun__user-badge {
      display: inline-block;
      padding: 2px 10px;
      background-color: #fef3c7;
      color: #92400e;
      border-radius: var(--radius-penuh);
      font-size: 12px;
      font-weight: 700;
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

      <!-- Logged In User Card (Aktif saat terotentikasi) -->
      <div class="akun__user-card" id="akun-user-card" style="display: none;">
        <div class="akun__user-avatar" id="akun-user-avatar">A</div>
        <div class="akun__user-info">
          <h2 class="akun__user-nama" id="akun-user-nama">Adopter CRSL</h2>
          <p class="akun__user-email" id="akun-user-email">adopter@crsl.id</p>
          <span class="akun__user-badge">⭐ Gold Member • 100 Poin</span>
        </div>
        <button type="button" class="akun__tombol akun__tombol--logout" id="tombol-logout">Logout</button>
      </div>

      <!-- Banner CTA (Gambar 4 - Aktif saat guest/belum login) -->
      <div class="akun__banner" id="akun-guest-banner">
        <div class="akun__banner-teks">
          <h2 class="akun__banner-judul">Join as a member to get more benefits</h2>
          <p class="akun__banner-subjudul">As a CRSL member, enjoy exclusive benefits, discounts, and earn points effortlessly with our free loyalty program.</p>
        </div>
        <div class="akun__banner-aksi">
          <button type="button" class="akun__tombol akun__tombol--login" id="tombol-buka-masuk" data-buka="modal-masuk">Login</button>
          <button type="button" class="akun__tombol akun__tombol--signup" id="tombol-buka-daftar" data-buka="modal-daftar">Signup</button>
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
        <div class="akun__kosong" id="akun-pesanan-kosong">
          <svg class="akun__kosong-ikon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M32 6L54 18V46L32 58L10 46V18L32 6Z"/>
            <path d="M10 18L32 30L54 18"/>
            <path d="M32 30V58"/>
            <path d="M21 12L43 24"/>
          </svg>
          <h4 class="akun__kosong-judul">No Orders Found</h4>
          <p class="akun__kosong-subjudul">Place an order to see it listed here.</p>
        </div>

        <!-- Wadah Daftar Pesanan Dinamis -->
        <div id="akun-daftar-pesanan" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;"></div>
      </div>

      <!-- Tab Konten: Wishlist -->
      <div class="akun__tab-konten" id="panel-wishlist" role="tabpanel" aria-labelledby="tab-wishlist">
        <div class="akun__kosong" id="akun-wishlist-kosong">
          <svg class="akun__kosong-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h4 class="akun__kosong-judul">Your Wishlist is Empty</h4>
          <p class="akun__kosong-subjudul">Explore our products and save your favorites here.</p>
        </div>
        <div id="akun-daftar-wishlist" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;"></div>
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
    // Tab switching & Pesanan Renderer
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

      // Render Riwayat Pesanan Sinkron SQLite & LocalStorage
      const pesananListEl = document.getElementById('akun-daftar-pesanan');
      const pesananKosongEl = document.getElementById('akun-pesanan-kosong');
      const pesananJudulEl = document.querySelector('.akun__pesanan-judul');
      const statusSelectEl = document.querySelector('.akun__status-select');

      async function ambilSemuaPesanan(filterStatus = 'all') {
        let liveOrders = [];
        try {
          const res = await fetch('/api/pesanan/daftar' + (filterStatus !== 'all' ? `?status=${filterStatus}` : ''));
          if (res.ok) {
            const json = await res.json();
            if (json.sukses && Array.isArray(json.pesanan)) {
              liveOrders = json.pesanan.map(p => ({
                id: p.nomor_pesanan,
                tanggal: p.dibuat_pada ? new Date(p.dibuat_pada).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Hari ini',
                status: p.status,
                kurir: p.kurir,
                nomor_resi: p.nomor_resi,
                total: p.total,
                items: p.items || []
              }));
            }
          }
        } catch (e) {
          console.warn('Gagal memuat pesanan live SQLite:', e);
        }

        // Ambil fallback local orders
        let localOrders = [];
        try {
          localOrders = JSON.parse(localStorage.getItem('crsl_orders') || '[]');
        } catch (e) {
          localOrders = [];
        }

        // Gabungkan tanpa duplikasi ID
        const map = new Map();
        liveOrders.forEach(o => map.set(o.id, o));
        localOrders.forEach(o => {
          if (!map.has(o.id)) {
            map.set(o.id, o);
          }
        });

        return Array.from(map.values());
      }

      async function renderOrders(filterStatus = 'all') {
        if (!pesananListEl) return;
        pesananListEl.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--warna-teks-redup);">
            <span>Memuat daftar pesanan...</span>
          </div>
        `;

        const allOrders = await ambilSemuaPesanan(filterStatus);
        pesananListEl.innerHTML = '';

        const filtered = allOrders.filter(o => {
          if (filterStatus === 'all') return true;
          if (filterStatus === 'unpaid') return o.status === 'belum_bayar' || o.status === 'menunggu_pembayaran';
          if (filterStatus === 'processing') return o.status === 'diproses' || o.status === 'akan_dikirim';
          if (filterStatus === 'shipped') return o.status === 'dikirim';
          if (filterStatus === 'completed') return o.status === 'selesai';
          if (filterStatus === 'cancelled') return o.status === 'dibatalkan';
          return true;
        });

        if (pesananJudulEl) {
          pesananJudulEl.textContent = `Pesanan Saya (${allOrders.length})`;
        }

        if (filtered.length === 0) {
          pesananKosongEl.style.display = 'block';
        } else {
          pesananKosongEl.style.display = 'none';
          filtered.forEach(o => {
            const card = document.createElement('div');
            card.style.cssText = 'background: var(--warna-permukaan); border: 1px solid var(--warna-batas); border-radius: var(--radius-lg); padding: 1.25rem; box-shadow: var(--bayangan-sm); display: flex; flex-direction: column; gap: 0.75rem;';

            let badgeWarna = '#d97706';
            let badgeBg = '#fffbeb';
            let badgeLabel = 'Menunggu Pembayaran';
            if (o.status === 'diproses' || o.status === 'akan_dikirim') {
              badgeWarna = '#2563eb';
              badgeBg = '#eff6ff';
              badgeLabel = 'Sedang Diproses';
            }
            if (o.status === 'dikirim') {
              badgeWarna = '#7c3aed';
              badgeBg = '#f5f3ff';
              badgeLabel = o.nomor_resi ? `Dikirim (Resi: ${o.nomor_resi})` : 'Dalam Pengiriman';
            }
            if (o.status === 'selesai') {
              badgeWarna = '#059669';
              badgeBg = '#ecfdf5';
              badgeLabel = 'Selesai';
            }
            if (o.status === 'dibatalkan') {
              badgeWarna = '#dc2626';
              badgeBg = '#fef2f2';
              badgeLabel = 'Dibatalkan';
            }

            card.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--warna-batas); padding-bottom: 0.5rem; font-size: 0.85rem;">
                <div>
                  <strong style="color: var(--warna-primer);">${o.id}</strong>
                  <span style="color: var(--warna-teks-redup); margin-left: 0.5rem;">• ${o.tanggal}</span>
                </div>
                <span style="background: ${badgeBg}; color: ${badgeWarna}; padding: 0.2rem 0.6rem; border-radius: var(--radius-penuh); font-weight: 700; font-size: 0.75rem;">
                  ${badgeLabel}
                </span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${(o.items || []).map(it => `
                  <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem;">
                    <img src="${it.gambar}" alt="${it.nama || it.nama_produk}" style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-md); background: var(--warna-latar-sekunder);">
                    <div style="flex-grow: 1;">
                      <div style="font-weight: 700; color: var(--warna-teks);">${it.nama || it.nama_produk}</div>
                      <div style="font-size: 0.75rem; color: var(--warna-teks-redup);">${it.varian || it.ukuran || 'Standar'} (x${it.jumlah || 1})</div>
                    </div>
                    <div style="font-weight: 700; color: var(--warna-teks);">Rp ${((it.harga || 0) * (it.jumlah || 1)).toLocaleString('id-ID')}</div>
                  </div>
                `).join('')}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--warna-batas); padding-top: 0.75rem; margin-top: 0.25rem;">
                <div style="font-size: 0.85rem;">
                  <span style="color: var(--warna-teks-redup);">Total:</span>
                  <strong style="color: var(--warna-primer); font-size: 1rem; margin-left: 0.25rem;">Rp ${(o.total || 0).toLocaleString('id-ID')}</strong>
                </div>
                <a href="/invoice/${o.id}" style="font-size: 0.85rem; font-weight: 700; color: var(--warna-primer); border: 1.5px solid var(--warna-primer); padding: 0.35rem 0.85rem; border-radius: var(--radius-penuh); text-decoration: none;">
                  Lihat Faktur
                </a>
              </div>
            `;
            pesananListEl.appendChild(card);
          });
        }
      }

      statusSelectEl?.addEventListener('change', (e) => {
        renderOrders(e.target.value);
      });

      renderOrders('all');
    });
  </script>
</body>
</html>
