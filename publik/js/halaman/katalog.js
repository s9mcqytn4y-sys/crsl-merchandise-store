/**
 * CRSL Merchandise Store - Katalog All Products Controller
 * Standar /antislop-ui, /antislop-code, /baseline-ui, /007
 * - Smart Filtering & Multi-Level Sorting
 * - Infinite Lazy Loading dengan Batching & Loading Spinner
 * - Quick Add to Cart & Drawer Integration
 * - Sold-out Dynamic Mute Constraints & Pre-order Indicators
 */

const KatalogManager = (() => {
  let semuaProduk = [];
  let semuaKategori = [];
  let produkTerfilter = [];
  
  // State Filter & Sorting
  let kategoriAktif = 'all-products';
  let searchQuery = '';
  let sortAktif = 'terbaru';
  let statusStokAktif = ['in_stock', 'pre_order']; // default tidak sertakan sold out kecuali dicentang
  let minHarga = null;
  let maxHarga = null;

  // State Lazy Loading
  const BATCH_SIZE = 8;
  let tampilJumlah = BATCH_SIZE;
  let sedangMemuat = false;

  // DOM Elements
  let gridContainer = null;
  let emptyState = null;
  let loaderEl = null;
  let totalLabel = null;
  let searchInput = null;
  let searchClearBtn = null;
  let sortSelect = null;
  let filterBadge = null;

  // Drawer Elements
  let drawerOverlay = null;
  let btnBukaDrawer = null;
  let btnTutupDrawer = null;
  let btnApplyDrawer = null;
  let btnResetDrawer = null;

  function init() {
    gridContainer = document.getElementById('katalog-grid-produk');
    emptyState = document.getElementById('katalog-empty-state');
    loaderEl = document.getElementById('katalog-loader');
    totalLabel = document.getElementById('katalog-total-produk');
    searchInput = document.getElementById('katalog-search-input');
    searchClearBtn = document.getElementById('katalog-search-clear');
    sortSelect = document.getElementById('katalog-select-sort');
    filterBadge = document.getElementById('katalog-filter-badge');

    drawerOverlay = document.getElementById('katalog-filter-drawer-overlay');
    btnBukaDrawer = document.getElementById('btn-buka-filter-drawer');
    btnTutupDrawer = document.getElementById('btn-close-filter-drawer');
    btnApplyDrawer = document.getElementById('btn-apply-drawer');
    btnResetDrawer = document.getElementById('btn-reset-drawer');

    // 1. Baca payload data dari DOM
    const payloadEl = document.getElementById('katalog-payload-data');
    if (payloadEl) {
      try {
        const parsed = JSON.parse(payloadEl.textContent);
        semuaProduk = parsed.daftarProduk || [];
        semuaKategori = parsed.daftarKategori || [];
        if (parsed.kategoriAktif) {
          kategoriAktif = parsed.kategoriAktif;
        }
      } catch (e) {
        console.warn('Gagal membaca data katalog:', e);
      }
    }

    // 2. Baca URL Query Parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('kategori')) {
      kategoriAktif = urlParams.get('kategori');
    }
    if (urlParams.has('q')) {
      searchQuery = urlParams.get('q').trim();
      if (searchInput) searchInput.value = searchQuery;
    }
    if (urlParams.has('sort')) {
      sortAktif = urlParams.get('sort');
      if (sortSelect) sortSelect.value = sortAktif;
    }

    // 3. Setup Listeners
    setupCategoryPills();
    setupSearch();
    setupSort();
    setupDrawer();
    setupScrollLazyLoad();

    // 4. Initial Render
    jalankanFilterDanRender();
  }

  /* ==========================================================
     A. Algoritma Filtering & Sorting Cerdas
     ========================================================== */
  function jalankanFilterDanRender(resetBatch = true) {
    if (resetBatch) {
      tampilJumlah = BATCH_SIZE;
    }

    // 1. Filter Kategori
    let hasil = semuaProduk.filter(p => {
      if (!kategoriAktif || kategoriAktif === 'all-products') return true;
      if (p.slug_kategori === kategoriAktif) return true;
      // Fallback matching
      const katObj = semuaKategori.find(k => k.slug === kategoriAktif);
      if (katObj && p.kategori_id === katObj.id) return true;
      return false;
    });

    // 2. Filter Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      hasil = hasil.filter(p => {
        const nama = (p.nama || '').toLowerCase();
        const desk = (p.deskripsi || '').toLowerCase();
        const kat = (p.nama_kategori || '').toLowerCase();
        return nama.includes(q) || desk.includes(q) || kat.includes(q);
      });
    }

    // 3. Filter Status Stok
    hasil = hasil.filter(p => {
      const status = p.status_stok || (p.stok <= 0 ? 'out_of_stock' : 'in_stock');
      return statusStokAktif.includes(status);
    });

    // 4. Filter Rentang Harga
    if (minHarga !== null) {
      hasil = hasil.filter(p => {
        const hargaAktif = p.harga_diskon || p.harga;
        return hargaAktif >= minHarga;
      });
    }
    if (maxHarga !== null) {
      hasil = hasil.filter(p => {
        const hargaAktif = p.harga_diskon || p.harga;
        return hargaAktif <= maxHarga;
      });
    }

    // 5. Sorting
    hasil.sort((a, b) => {
      const hargaA = a.harga_diskon || a.harga;
      const hargaB = b.harga_diskon || b.harga;
      const diskonA = a.harga_diskon && a.harga_diskon < a.harga ? (a.harga - a.harga_diskon) / a.harga : 0;
      const diskonB = b.harga_diskon && b.harga_diskon < b.harga ? (b.harga - b.harga_diskon) / b.harga : 0;

      switch (sortAktif) {
        case 'harga_asc':
          return hargaA - hargaB;
        case 'harga_desc':
          return hargaB - hargaA;
        case 'diskon_desc':
          return diskonB - diskonA;
        case 'nama_asc':
          return (a.nama || '').localeCompare(b.nama || '');
        case 'terbaru':
        default:
          return (b.id || 0) - (a.id || 0);
      }
    });

    produkTerfilter = hasil;

    // Update total counter
    if (totalLabel) {
      totalLabel.textContent = produkTerfilter.length;
    }

    // Update Filter Badge di tombol Filter
    updateFilterBadge();

    // Render Grid
    renderCards();
  }

  /* ==========================================================
     B. Rendering Card Produk & Sold-out Constraints
     ========================================================== */
  function renderCards() {
    if (!gridContainer) return;

    if (produkTerfilter.length === 0) {
      gridContainer.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (loaderEl) loaderEl.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Ambil slice produk berdasarkan batch lazy load
    const itemsToShow = produkTerfilter.slice(0, tampilJumlah);

    let html = '';
    itemsToShow.forEach(p => {
      const hargaAktif = p.harga_diskon || p.harga;
      const adaDiskon = p.harga_diskon && p.harga_diskon < p.harga;
      const persenDiskon = adaDiskon ? Math.round(((p.harga - p.harga_diskon) / p.harga) * 100) : 0;
      const isSoldOut = (p.status_stok === 'out_of_stock' || (p.stok !== null && p.stok <= 0));
      const isPreOrder = (p.tipe_produk === 'pre_order');
      const gambar = p.gambar_utama || '/aset/gambar/cassie-wallet.webp';
      const slug = p.slug || `produk-${p.id}`;
      const urlDetail = `/produk/${encodeURIComponent(slug)}`;

      html += `
        <article class="katalog-card ${isSoldOut ? 'sold-out' : ''}" data-id="${p.id}">
          <div class="katalog-card__media">
            
            <div class="katalog-card__badges">
              ${isSoldOut ? `<span class="katalog-badge-soldout">SOLD OUT</span>` : ''}
              ${!isSoldOut && isPreOrder ? `<span class="katalog-badge-po">PRE ORDER</span>` : ''}
            </div>

            ${adaDiskon ? `<span class="katalog-card__badge-diskon">${persenDiskon}% OFF</span>` : ''}

            <a href="${urlDetail}" aria-label="Lihat rincian ${escapeHtml(p.nama)}">
              <img
                src="${gambar}"
                alt="${escapeHtml(p.nama)}"
                class="katalog-card__img"
                loading="lazy"
                width="280"
                height="280"
              >
            </a>

            <!-- Tombol Quick Add to Cart -->
            <button
              type="button"
              class="katalog-card__btn-quick-cart"
              data-id="${p.id}"
              data-nama="${escapeHtml(p.nama)}"
              data-harga="${hargaAktif}"
              data-harga-coret="${p.harga}"
              data-gambar="${gambar}"
              data-slug="${slug}"
              ${isSoldOut ? 'disabled title="Produk sedang habis"' : 'title="Masukkan ke keranjang"'}
              aria-label="Tambah ${escapeHtml(p.nama)} ke keranjang"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </button>
          </div>

          <div class="katalog-card__info">
            <span class="katalog-card__kategori">${escapeHtml(p.nama_kategori || 'Merchandise')}</span>
            <h3 class="katalog-card__nama" title="${escapeHtml(p.nama)}">
              <a href="${urlDetail}">${escapeHtml(p.nama)}</a>
            </h3>
            <div class="katalog-card__harga-wrap">
              <span class="katalog-card__harga-aktif">Rp ${Number(hargaAktif).toLocaleString('id-ID')}</span>
              ${adaDiskon ? `<span class="katalog-card__harga-coret">Rp ${Number(p.harga).toLocaleString('id-ID')}</span>` : ''}
            </div>
          </div>
        </article>
      `;
    });

    gridContainer.innerHTML = html;

    // Pasang listener Quick Add to Cart
    attachQuickCartListeners();

    // Tampilkan / Sembunyikan Loader
    if (loaderEl) {
      if (tampilJumlah < produkTerfilter.length) {
        loaderEl.style.display = 'flex';
      } else {
        loaderEl.style.display = 'none';
      }
    }
  }

  /* ==========================================================
     C. Quick Add to Cart Logic
     ========================================================== */
  function attachQuickCartListeners() {
    const btns = gridContainer.querySelectorAll('.katalog-card__btn-quick-cart');
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (btn.disabled) return;

        const item = {
          id: parseInt(btn.getAttribute('data-id'), 10),
          nama: btn.getAttribute('data-nama'),
          harga: parseInt(btn.getAttribute('data-harga'), 10),
          hargaCoret: parseInt(btn.getAttribute('data-harga-coret'), 10),
          gambar: btn.getAttribute('data-gambar'),
          varian: 'Default',
          jumlah: 1,
          tipe: 'regular'
        };

        if (typeof Keranjang !== 'undefined') {
          const items = Keranjang.ambilItems ? Keranjang.ambilItems() : [];
          const idx = items.findIndex(i => i.id === item.id && i.varian === item.varian);
          if (idx > -1) {
            items[idx].jumlah += 1;
          } else {
            items.push(item);
          }
          if (Keranjang.simpanItems) {
            Keranjang.simpanItems(items);
          }
          if (Keranjang.bukaCart) {
            Keranjang.bukaCart();
          }
          tampilkanKatalogToast(`${item.nama} dimasukkan ke keranjang!`);
        }
      });
    });
  }

  /* ==========================================================
     D. Category Horizontal Pills
     ========================================================== */
  function setupCategoryPills() {
    const pills = document.querySelectorAll('.katalog-kategori-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.classList.remove('aktif');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('aktif');
        pill.setAttribute('aria-selected', 'true');

        kategoriAktif = pill.getAttribute('data-kategori');
        
        // Update URL state tanpa refresh penuh
        const url = new URL(window.location.href);
        if (kategoriAktif && kategoriAktif !== 'all-products') {
          url.searchParams.set('kategori', kategoriAktif);
        } else {
          url.searchParams.delete('kategori');
        }
        window.history.replaceState({}, '', url);

        jalankanFilterDanRender(true);
      });
    });
  }

  /* ==========================================================
     E. Search Input & Realtime Debouncing
     ========================================================== */
  function setupSearch() {
    if (!searchInput) return;

    let timeout = null;
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();

      if (searchClearBtn) {
        searchClearBtn.style.display = searchQuery ? 'block' : 'none';
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        jalankanFilterDanRender(true);
      }, 250);
    });

    searchClearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      jalankanFilterDanRender(true);
    });

    // Tombol reset empty state
    document.getElementById('btn-reset-filter-empty')?.addEventListener('click', () => {
      resetSemuaFilter();
    });
  }

  /* ==========================================================
     F. Sorting Select Dropdown
     ========================================================== */
  function setupSort() {
    sortSelect?.addEventListener('change', (e) => {
      sortAktif = e.target.value;
      jalankanFilterDanRender(false);
    });
  }

  /* ==========================================================
     G. Pop-Up Drawer Filter & Sort
     ========================================================== */
  function setupDrawer() {
    if (!btnBukaDrawer || !drawerOverlay) return;

    function bukaDrawer() {
      drawerOverlay.style.display = 'flex';
      void drawerOverlay.offsetWidth;
      drawerOverlay.classList.add('aktif');
      drawerOverlay.setAttribute('aria-hidden', 'false');
      btnBukaDrawer.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function tutupDrawer() {
      drawerOverlay.classList.remove('aktif');
      drawerOverlay.setAttribute('aria-hidden', 'true');
      btnBukaDrawer.setAttribute('aria-expanded', 'false');
      setTimeout(() => {
        drawerOverlay.style.display = 'none';
      }, 250);
      document.body.style.overflow = '';
    }

    btnBukaDrawer.addEventListener('click', bukaDrawer);
    btnTutupDrawer?.addEventListener('click', tutupDrawer);
    drawerOverlay.addEventListener('click', (e) => {
      if (e.target === drawerOverlay) tutupDrawer();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawerOverlay.classList.contains('aktif')) {
        tutupDrawer();
      }
    });

    // Apply Filter dari Drawer
    btnApplyDrawer?.addEventListener('click', () => {
      // 1. Sort radio
      const radioSort = document.querySelector('input[name="drawer_sort"]:checked');
      if (radioSort) {
        sortAktif = radioSort.value;
        if (sortSelect) sortSelect.value = sortAktif;
      }

      // 2. Stock checkbox
      statusStokAktif = [];
      if (document.getElementById('filter-status-ready')?.checked) statusStokAktif.push('in_stock');
      if (document.getElementById('filter-status-po')?.checked) statusStokAktif.push('pre_order');
      if (document.getElementById('filter-status-soldout')?.checked) statusStokAktif.push('out_of_stock');

      // 3. Price range
      const minVal = parseInt(document.getElementById('filter-harga-min')?.value, 10);
      const maxVal = parseInt(document.getElementById('filter-harga-max')?.value, 10);
      minHarga = !isNaN(minVal) && minVal > 0 ? minVal : null;
      maxHarga = !isNaN(maxVal) && maxVal > 0 ? maxVal : null;

      jalankanFilterDanRender(true);
      tutupDrawer();
      tampilkanKatalogToast('Filter berhasil diterapkan.');
    });

    // Reset Drawer
    btnResetDrawer?.addEventListener('click', () => {
      resetSemuaFilter();
      tutupDrawer();
    });
  }

  function resetSemuaFilter() {
    kategoriAktif = 'all-products';
    searchQuery = '';
    sortAktif = 'terbaru';
    statusStokAktif = ['in_stock', 'pre_order'];
    minHarga = null;
    maxHarga = null;

    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.style.display = 'none';
    if (sortSelect) sortSelect.value = 'terbaru';

    // Reset drawer input fields
    const defaultRadio = document.querySelector('input[name="drawer_sort"][value="terbaru"]');
    if (defaultRadio) defaultRadio.checked = true;

    const cbReady = document.getElementById('filter-status-ready');
    const cbPo = document.getElementById('filter-status-po');
    const cbSold = document.getElementById('filter-status-soldout');
    if (cbReady) cbReady.checked = true;
    if (cbPo) cbPo.checked = true;
    if (cbSold) cbSold.checked = false;

    const inMin = document.getElementById('filter-harga-min');
    const inMax = document.getElementById('filter-harga-max');
    if (inMin) inMin.value = '';
    if (inMax) inMax.value = '';

    // Reset pills
    const pills = document.querySelectorAll('.katalog-kategori-pill');
    pills.forEach(p => {
      const isAll = p.getAttribute('data-kategori') === 'all-products';
      p.classList.toggle('aktif', isAll);
      p.setAttribute('aria-selected', isAll ? 'true' : 'false');
    });

    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);

    jalankanFilterDanRender(true);
  }

  function updateFilterBadge() {
    if (!filterBadge) return;
    let aktifCount = 0;
    if (kategoriAktif && kategoriAktif !== 'all-products') aktifCount++;
    if (searchQuery) aktifCount++;
    if (sortAktif !== 'terbaru') aktifCount++;
    if (statusStokAktif.includes('out_of_stock')) aktifCount++;
    if (!statusStokAktif.includes('in_stock') || !statusStokAktif.includes('pre_order')) aktifCount++;
    if (minHarga !== null || maxHarga !== null) aktifCount++;

    if (aktifCount > 0) {
      filterBadge.textContent = aktifCount;
      filterBadge.style.display = 'inline-flex';
    } else {
      filterBadge.style.display = 'none';
    }
  }

  /* ==========================================================
     H. Lazy Loading via Scroll Listener / Intersection
     ========================================================== */
  function setupScrollLazyLoad() {
    window.addEventListener('scroll', () => {
      if (sedangMemuat) return;
      if (tampilJumlah >= produkTerfilter.length) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.offsetHeight - 400;

      if (scrollBottom >= threshold) {
        sedangMemuat = true;
        if (loaderEl) loaderEl.style.display = 'flex';

        setTimeout(() => {
          tampilJumlah += BATCH_SIZE;
          renderCards();
          sedangMemuat = false;
        }, 300);
      }
    }, { passive: true });
  }

  function tampilkanKatalogToast(pesan) {
    const toast = document.getElementById('katalog-toast');
    if (!toast) return;
    toast.textContent = pesan;
    toast.classList.add('aktif');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('aktif');
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  KatalogManager.init();
});
