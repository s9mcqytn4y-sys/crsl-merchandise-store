/**
 * Akun Page Controller - CRSL Merchandise Store
 * Mengelola tab pesanan, pemfilteran status, modal loyalty tiers, dan terms dialog
 * Standar: Vanilla JS, Zero External Frameworks, WCAG 2.2 AA.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabs = document.querySelectorAll('.akun-tab-btn');
  const panelPesanan = document.getElementById('panel-pesanan');
  const panelWishlist = document.getElementById('panel-wishlist');
  const ordersListEl = document.getElementById('akun-orders-list');
  const ordersCountEl = document.getElementById('akun-orders-count');
  const statusSelectEl = document.getElementById('akun-orders-status-select');
  
  // Loyalty Modal Elements
  const btnSeeDetails = document.getElementById('btn-see-loyalty-details');
  const modalLoyalty = document.getElementById('modal-loyalty-overlay');
  const btnCloseLoyalty = document.getElementById('btn-close-loyalty');
  
  // Loyalty Terms Modal Elements
  const btnSeeTerms = document.getElementById('btn-see-loyalty-terms');
  const modalTerms = document.getElementById('modal-terms-overlay');
  const btnCloseTerms = document.getElementById('btn-close-terms');

  // 1. Tab Switching (Orders vs Wishlist)
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('aktif');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('aktif');
      tab.setAttribute('aria-selected', 'true');

      const targetId = tab.getAttribute('aria-controls');
      if (targetId === 'panel-pesanan') {
        panelPesanan?.style.setProperty('display', 'block');
        panelWishlist?.style.setProperty('display', 'none');
      } else if (targetId === 'panel-wishlist') {
        panelPesanan?.style.setProperty('display', 'none');
        panelWishlist?.style.setProperty('display', 'block');
        renderWishlist();
      }
    });
  });

  // 2. Fetch & Render Orders (Actual DB + LocalStorage fallback)
  async function loadOrders(statusFilter = 'all') {
    if (!ordersListEl) return;
    ordersListEl.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #9ca3af;">
        <span>Memuat riwayat pesanan...</span>
      </div>
    `;

    let orders = [];
    try {
      const res = await fetch('/api/pesanan/daftar' + (statusFilter !== 'all' ? `?status=${statusFilter}` : ''));
      if (res.ok) {
        const json = await res.json();
        if (json.sukses && Array.isArray(json.pesanan)) {
          orders = json.pesanan;
        }
      }
    } catch (err) {
      console.warn('Gagal memuat pesanan dari API:', err);
    }

    // Merge with any offline demo orders in localStorage
    try {
      const local = JSON.parse(localStorage.getItem('crsl_orders') || '[]');
      if (Array.isArray(local)) {
        const existingIds = new Set(orders.map(o => o.nomor_pesanan));
        local.forEach(lo => {
          if (!existingIds.has(lo.nomor_pesanan || lo.id)) {
            orders.push(lo);
          }
        });
      }
    } catch (e) {}

    // Filter status
    const filtered = orders.filter(o => {
      if (statusFilter === 'all') return true;
      const st = (o.status || '').toLowerCase();
      if (statusFilter === 'unpaid') return st === 'belum_bayar' || st === 'unpaid';
      if (statusFilter === 'processing') return st === 'akan_dikirim' || st === 'diproses' || st === 'processing';
      if (statusFilter === 'shipped') return st === 'dikirim' || st === 'shipped';
      if (statusFilter === 'completed') return st === 'selesai' || st === 'completed';
      if (statusFilter === 'cancelled') return st === 'dibatalkan' || st === 'cancelled';
      return true;
    });

    if (ordersCountEl) {
      ordersCountEl.textContent = `My Orders (${filtered.length})`;
    }

    ordersListEl.innerHTML = '';

    if (filtered.length === 0) {
      ordersListEl.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; border: 1px dashed #e5e7eb; border-radius: 12px; background: #fafafa;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.75rem;">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <div style="font-weight: 600; color: #374151; font-size: 15px; margin-bottom: 4px;">No Orders Found</div>
          <div style="color: #9ca3af; font-size: 13px;">Belum ada pesanan dengan status yang dipilih.</div>
        </div>
      `;
      return;
    }

    filtered.forEach(o => {
      const card = document.createElement('div');
      card.className = 'akun-order-card';

      // Format date
      let dateStr = 'Sep 18, 2026';
      if (o.dibuat_pada) {
        const d = new Date(o.dibuat_pada);
        dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      // Status label & color
      let statusLabel = 'Cancelled';
      let statusColor = '#9ca3af';
      const st = (o.status || '').toLowerCase();
      if (st === 'dibatalkan' || st === 'cancelled') {
        statusLabel = 'Dibatalkan';
        statusColor = '#9ca3af';
      } else if (st === 'kedaluwarsa') {
        statusLabel = 'Kedaluwarsa';
        statusColor = '#ef4444';
      } else if (st === 'selesai' || st === 'completed') {
        statusLabel = 'Selesai';
        statusColor = '#10b981';
      } else if (st === 'dikirim' || st === 'shipped') {
        statusLabel = 'Dalam Pengiriman';
        statusColor = '#8b5cf6';
      } else if (st === 'diproses' || st === 'akan_dikirim' || st === 'processing') {
        statusLabel = 'Diproses';
        statusColor = '#3b82f6';
      } else if (st === 'belum_bayar' || st === 'unpaid') {
        statusLabel = 'Belum Bayar';
        statusColor = '#f59e0b';
      }

      // Items parsing
      let items = o.items || [];
      if (typeof items === 'string') {
        try { items = json.parse(items); } catch(e) { items = []; }
      }
      if (!Array.isArray(items) || items.length === 0) {
        items = [{
          nama: 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid | Compact & Stylish',
          varian: 'CHOCO BROWN',
          harga: 199000,
          jumlah: 1,
          gambar: '/aset/gambar/crsl-cassie-wallet-main.jpg'
        }];
      }

      const orderNumber = o.nomor_pesanan || o.id || '-';
      const totalAmount = o.total || 0;
      const diskonAmount = o.diskon || 0;
      const totalItemsCount = items.reduce((sum, it) => sum + (it.jumlah || 1), 0);

      const itemsHtml = items.map(it => {
        const imgUrl = it.gambar || it.url_gambar || '/aset/gambar/bundle-miflo-cover.webp';
        const title = it.nama || it.nama_produk || 'Produk CRSL';
        const variant = it.varian || it.ukuran || '-';
        const price = it.harga || 0;
        const qty = it.jumlah || 1;

        return `
          <div class="akun-order-card__item">
            <img src="${imgUrl}" alt="${title}" class="akun-order-card__img" onerror="this.src='/aset/gambar/bundle-miflo-cover.webp'" loading="lazy">
            <div class="akun-order-card__details">
              <div class="akun-order-card__title">${title}</div>
              <div class="akun-order-card__variant">${variant}</div>
            </div>
            <div class="akun-order-card__price-col">
              <div class="akun-order-card__price">Rp ${price.toLocaleString('id-ID')}</div>
              <div class="akun-order-card__qty">&times;${qty}</div>
            </div>
          </div>
        `;
      }).join('');

      // Tombol aksi berdasarkan status
      const isKedaluwarsa = st === 'kedaluwarsa';
      const isBelumBayar  = st === 'belum_bayar' || st === 'unpaid';
      const sudahBisaRetry = isKedaluwarsa && !(o.catatan || '').includes('[RETRY]');

      const footerAksi = isBelumBayar
        ? `<a href="/checkout" class="akun-order-card__btn akun-order-card__btn--bayar">Selesaikan Pembayaran</a>`
        : isKedaluwarsa && sudahBisaRetry
          ? `<button class="akun-order-card__btn akun-order-card__btn--retry" data-nomor="${orderNumber}">Bayar Ulang</button>`
          : `<a href="/invoice/${encodeURIComponent(orderNumber)}" class="akun-order-card__btn">Lihat Invoice</a>`;

      const diskonHtml = diskonAmount > 0
        ? `<div class="akun-order-card__diskon">Hemat Rp ${diskonAmount.toLocaleString('id-ID')}</div>`
        : '';

      const kurirInfo = o.kurir ? ` &bull; ${o.kurir}` : '';
      const resiInfo  = o.nomor_resi ? ` &bull; Resi: <strong>${o.nomor_resi}</strong>` : '';

      card.dataset.nomor = orderNumber;
      card.dataset.status = st;

      card.innerHTML = `
        <div class="akun-order-card__header">
          <div class="akun-order-card__id">${orderNumber}</div>
          <div class="akun-order-card__status" style="color: ${statusColor}; font-weight: 700;">${statusLabel}</div>
        </div>
        <div class="akun-order-card__meta">${dateStr}${kurirInfo}${resiInfo}</div>
        ${itemsHtml}
        <div class="akun-order-card__footer">
          <div>
            <span class="akun-order-card__total">Rp ${totalAmount.toLocaleString('id-ID')}</span>
            <span class="akun-order-card__item-count">(${totalItemsCount} item)</span>
            ${diskonHtml}
          </div>
          ${footerAksi}
        </div>
      `;

      ordersListEl.appendChild(card);
    });

    // Bind retry buttons
    ordersListEl.querySelectorAll('.akun-order-card__btn--retry').forEach(btn => {
      btn.addEventListener('click', () => retryBayar(btn.dataset.nomor, btn));
    });

    // Start polling untuk pesanan belum_bayar
    pollStatusPesanan();
  }

  statusSelectEl?.addEventListener('change', (e) => {
    loadOrders(e.target.value);
  });

  // Initial load
  loadOrders('all');

  // -------------------------
  // Retry Bayar
  // -------------------------
  async function retryBayar(nomorPesanan, btn) {
    if (!nomorPesanan) return;
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
      const res = await fetch('/api/pesanan/retry-bayar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor_pesanan: nomorPesanan })
      });
      const data = await res.json();
      if (data.sukses) {
        // Update localStorage
        const local = JSON.parse(localStorage.getItem('crsl_orders') || '[]');
        const idx = local.findIndex(o => (o.nomor_pesanan || o.id) === nomorPesanan);
        if (idx !== -1) {
          local[idx].status = 'belum_bayar';
          local[idx].waktu_kedaluwarsa = data.waktu_kedaluwarsa;
          localStorage.setItem('crsl_orders', JSON.stringify(local));
        }
        // Redirect ke checkout untuk bayar ulang
        window.location.href = '/checkout';
      } else {
        alert(data.pesan || 'Gagal memproses retry pembayaran.');
        btn.disabled = false;
        btn.textContent = origText;
      }
    } catch (e) {
      alert('Koneksi bermasalah. Coba lagi.');
      btn.disabled = false;
      btn.textContent = origText;
    }
  }

  // -------------------------
  // Polling Status Pesanan Belum Bayar
  // -------------------------
  let pollingInterval = null;

  function pollStatusPesanan() {
    if (pollingInterval) clearInterval(pollingInterval);

    const pendingCards = ordersListEl
      ? Array.from(ordersListEl.querySelectorAll('[data-status="belum_bayar"]'))
      : [];

    if (pendingCards.length === 0) return;

    pollingInterval = setInterval(async () => {
      for (const card of pendingCards) {
        const nomor = card.dataset.nomor;
        if (!nomor) continue;
        try {
          const res = await fetch(`/api/pesanan/status/${encodeURIComponent(nomor)}`);
          if (!res.ok) continue;
          const data = await res.json();
          if (!data.sukses) continue;

          const newStatus = data.pesanan?.status || '';
          if (newStatus !== 'belum_bayar') {
            // Status berubah, reload orders list
            clearInterval(pollingInterval);
            const currentFilter = statusSelectEl?.value || 'all';
            loadOrders(currentFilter);
            break;
          }
        } catch (e) {
          // silent fail
        }
      }
    }, 15000); // poll every 15 seconds
  }

  // 3. Wishlist renderer
  function renderWishlist() {
    const container = document.getElementById('akun-daftar-wishlist');
    const emptyEl = document.getElementById('akun-wishlist-kosong');
    if (!container) return;

    let wishlist = [];
    try {
      wishlist = JSON.parse(localStorage.getItem('crsl_wishlist') || '[]');
    } catch(e) {}

    if (wishlist.length === 0) {
      if (emptyEl) emptyEl.style.display = 'flex';
      container.innerHTML = '';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    container.innerHTML = wishlist.map(p => `
      <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; display: flex; flex-direction: column;">
        <img src="${p.gambar || '/aset/gambar/crsl-choco-oversized-hoodie-main.png'}" alt="${p.nama}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
        <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 4px; line-height: 1.3;">${p.nama}</div>
        <div style="font-size: 13px; font-weight: 700; color: #e52027; margin-bottom: 8px;">Rp ${(p.harga || 0).toLocaleString('id-ID')}</div>
        <a href="/produk/${p.slug || 'crsl-choco-oversized-hoodie'}" class="akun-btn-pill" style="text-align: center; width: 100%; justify-content: center; box-sizing: border-box;">Lihat Produk</a>
      </div>
    `).join('');
  }

  // 4. Modal Loyalty (Screenshot 4) Handlers
  function openLoyaltyModal() {
    modalLoyalty?.classList.add('aktif');
    document.body.style.overflow = 'hidden';
  }

  function closeLoyaltyModal() {
    modalLoyalty?.classList.remove('aktif');
    document.body.style.overflow = '';
  }

  btnSeeDetails?.addEventListener('click', (e) => {
    e.preventDefault();
    openLoyaltyModal();
  });

  btnCloseLoyalty?.addEventListener('click', () => {
    closeLoyaltyModal();
  });

  modalLoyalty?.addEventListener('click', (e) => {
    if (e.target === modalLoyalty) {
      closeLoyaltyModal();
    }
  });

  // 5. Modal Loyalty Terms Handlers
  function openTermsModal() {
    modalTerms?.classList.add('aktif');
  }

  function closeTermsModal() {
    modalTerms?.classList.remove('aktif');
  }

  btnSeeTerms?.addEventListener('click', (e) => {
    e.preventDefault();
    openTermsModal();
  });

  btnCloseTerms?.addEventListener('click', () => {
    closeTermsModal();
  });

  modalTerms?.addEventListener('click', (e) => {
    if (e.target === modalTerms) {
      closeTermsModal();
    }
  });

  // 6. Global Escape Key Listener for Modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalTerms?.classList.contains('aktif')) {
        closeTermsModal();
      } else if (modalLoyalty?.classList.contains('aktif')) {
        closeLoyaltyModal();
      }
    }
  });

  // 7. Reseller & Settings handlers
  document.getElementById('btn-become-reseller')?.addEventListener('click', () => {
    window.location.href = 'https://wa.me/6281234567890?text=Halo%20CRSL,%20saya%20tertarik%20mendaftar%20sebagai%20Reseller%20resmi.';
  });

  document.getElementById('btn-account-settings')?.addEventListener('click', () => {
    alert('Fitur pengaturan profil dan alamat pengiriman sedang dipersiapkan.');
  });
});
