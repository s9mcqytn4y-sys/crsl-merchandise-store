/**
 * Keranjang Belanja - Cart State & Modals
 * Mendukung Add to Cart pop-up, Cart drawer, dan bar melayang bawah layar
 */

const Keranjang = (() => {
  const STORAGE_KEY = 'crsl_keranjang';

  let state = {
    items: [],
    modalAddCart: null,
    modalAddOverlay: null,
    drawerCart: null,
    drawerCartOverlay: null,
    barBawah: null,
    produkAktif: null,
    varianAktif: 'CHILO PINK',
    qtyAktif: 1,
  };

  function ambilItems() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function simpanItems(items) {
    state.items = items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    render();
  }

  function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
  }

  function hitungTotal() {
    let totalHarga = 0;
    let totalHargaAsli = 0;
    let totalItem = 0;

    state.items.forEach(item => {
      totalHarga += item.harga * item.jumlah;
      totalHargaAsli += (item.hargaCoret || item.harga) * item.jumlah;
      totalItem += item.jumlah;
    });

    return {
      totalHarga,
      totalHargaAsli,
      totalHemat: totalHargaAsli - totalHarga,
      totalItem,
    };
  }

  function bukaAddCart(produk) {
    state.produkAktif = produk || {
      id: 'cassie-wallet',
      nama: 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid | Compact & Stylish',
      harga: 179100,
      hargaCoret: 199000,
      gambar: '/aset/gambar/cassie-wallet.webp',
      varianPilihan: ['CHILO PINK', 'CHOCO BROWN']
    };
    state.varianAktif = state.produkAktif.varianPilihan ? state.produkAktif.varianPilihan[0] : 'CHILO PINK';
    state.qtyAktif = 1;

    // Render data produk di modal
    const namaEl = document.getElementById('add-cart-nama');
    const thumbEl = document.getElementById('add-cart-thumb');
    const qtyEl = document.getElementById('add-cart-qty');

    if (namaEl) namaEl.textContent = state.produkAktif.nama;
    if (thumbEl) thumbEl.src = state.produkAktif.gambar;
    if (qtyEl) qtyEl.textContent = '1';

    // Update active color pill
    updateVarianUI();

    state.modalAddOverlay?.classList.add('aktif');
  }

  function tutupAddCart() {
    state.modalAddOverlay?.classList.remove('aktif');
  }

  function updateVarianUI() {
    const tombolVarian = document.querySelectorAll('.modal-add-cart__varian-item');
    tombolVarian.forEach(btn => {
      const varian = btn.getAttribute('data-varian');
      if (varian === state.varianAktif) {
        btn.classList.add('terpilih');
      } else {
        btn.classList.remove('terpilih');
      }
    });
  }

  function ubahQty(delta) {
    const baru = state.qtyAktif + delta;
    if (baru >= 1) {
      state.qtyAktif = baru;
      const qtyEl = document.getElementById('add-cart-qty');
      if (qtyEl) qtyEl.textContent = state.qtyAktif.toString();
    }
  }

  function submitAddCart() {
    if (!state.produkAktif) return;

    const items = ambilItems();
    const existingIndex = items.findIndex(
      item => item.id === state.produkAktif.id && item.varian === state.varianAktif
    );

    if (existingIndex > -1) {
      items[existingIndex].jumlah += state.qtyAktif;
    } else {
      items.push({
        id: state.produkAktif.id,
        nama: state.produkAktif.nama,
        harga: state.produkAktif.harga,
        hargaCoret: state.produkAktif.hargaCoret,
        gambar: state.produkAktif.gambar,
        varian: state.varianAktif,
        jumlah: state.qtyAktif,
      });
    }

    simpanItems(items);
    tutupAddCart();

    // Tutup overlay search jika terbuka
    if (typeof Pencarian !== 'undefined' && Pencarian.tutup) {
      Pencarian.tutup();
    }

    // Buka Drawer Cart
    setTimeout(() => {
      bukaCart();
    }, 200);
  }

  function bukaCart() {
    renderDrawerItems();
    state.drawerCartOverlay?.classList.add('aktif');
    state.drawerCart?.classList.add('aktif');
  }

  function tutupCart() {
    state.drawerCartOverlay?.classList.remove('aktif');
    state.drawerCart?.classList.remove('aktif');
  }

  function ubahJumlahItem(index, delta) {
    const items = ambilItems();
    if (!items[index]) return;

    items[index].jumlah += delta;
    if (items[index].jumlah <= 0) {
      items.splice(index, 1);
    }

    simpanItems(items);
  }

  function hapusItem(index) {
    const items = ambilItems();
    items.splice(index, 1);
    simpanItems(items);
  }

  function renderDrawerItems() {
    const wadah = document.getElementById('keranjang-items-list');
    if (!wadah) return;

    wadah.innerHTML = '';

    if (state.items.length === 0) {
      wadah.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--warna-teks-sekunder);">
          <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">Keranjang Masih Kosong</p>
          <p style="font-size: 0.9rem;">Pilih merchandise favorit kamu dan tambahkan ke sini.</p>
        </div>
      `;
      const footerEl = document.getElementById('keranjang-drawer-footer');
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    const footerEl = document.getElementById('keranjang-drawer-footer');
    if (footerEl) footerEl.style.display = 'flex';

    state.items.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'keranjang-item';
      itemEl.innerHTML = `
        <img src="${item.gambar}" alt="${item.nama}" class="keranjang-item__thumb">
        <div class="keranjang-item__rincian">
          <h4 class="keranjang-item__nama">${item.nama}</h4>
          <span class="keranjang-item__varian">${item.varian}</span>
          <span class="keranjang-item__badge-diskon">🏷️ 10% Off</span>
          <div style="display: flex; gap: 8px; align-items: baseline; margin-top: 4px;">
            ${item.hargaCoret ? `<p class="keranjang-item__harga-coret">${formatRupiah(item.hargaCoret)}</p>` : ''}
            <p class="keranjang-item__harga-aktif">${formatRupiah(item.harga)}</p>
          </div>
          <div class="keranjang-item__aksi-baris">
            <button type="button" class="keranjang-item__hapus" data-index="${index}">Remove</button>
            <div class="keranjang-item__stepper">
              <button type="button" class="keranjang-item__stepper-tombol kurang" data-index="${index}">-</button>
              <span class="keranjang-item__stepper-angka">${item.jumlah}</span>
              <button type="button" class="keranjang-item__stepper-tombol tambah" data-index="${index}">+</button>
            </div>
          </div>
        </div>
      `;
      wadah.appendChild(itemEl);
    });

    // Event listeners tombol di dalam item
    wadah.querySelectorAll('.keranjang-item__hapus').forEach(btn => {
      btn.addEventListener('click', () => {
        hapusItem(parseInt(btn.getAttribute('data-index'), 10));
      });
    });

    wadah.querySelectorAll('.keranjang-item__stepper-tombol.kurang').forEach(btn => {
      btn.addEventListener('click', () => {
        ubahJumlahItem(parseInt(btn.getAttribute('data-index'), 10), -1);
      });
    });

    wadah.querySelectorAll('.keranjang-item__stepper-tombol.tambah').forEach(btn => {
      btn.addEventListener('click', () => {
        ubahJumlahItem(parseInt(btn.getAttribute('data-index'), 10), 1);
      });
    });

    // Update total footer
    const total = hitungTotal();
    const totalLabel = document.getElementById('keranjang-total-label');
    const totalNilai = document.getElementById('keranjang-total-nilai');
    const hematEl = document.getElementById('keranjang-hemat-nilai');

    if (totalLabel) totalLabel.textContent = `Total Price (${total.totalItem})`;
    if (totalNilai) totalNilai.textContent = formatRupiah(total.totalHarga);
    if (hematEl) {
      if (total.totalHemat > 0) {
        hematEl.parentElement.style.display = 'flex';
        hematEl.textContent = `Save ${formatRupiah(total.totalHemat)}`;
      } else {
        hematEl.parentElement.style.display = 'none';
      }
    }
  }

  function renderBarBawah() {
    if (!state.barBawah) return;

    const total = hitungTotal();
    if (total.totalItem > 0) {
      state.barBawah.classList.add('aktif');
      const label = document.getElementById('bar-bawah-label');
      const harga = document.getElementById('bar-bawah-harga');
      const badge = document.getElementById('bar-bawah-badge');

      if (label) label.textContent = `${total.totalItem} Items in My Cart`;
      if (harga) harga.textContent = formatRupiah(total.totalHarga);
      if (badge) badge.textContent = total.totalItem.toString();
    } else {
      state.barBawah.classList.remove('aktif');
    }
  }

  function render() {
    renderBarBawah();
    if (state.drawerCart?.classList.contains('aktif')) {
      renderDrawerItems();
    }
  }

  function init() {
    state.items = ambilItems();

    state.modalAddOverlay = document.getElementById('modal-add-cart-overlay');
    state.modalAddCart = document.getElementById('modal-add-cart');
    state.drawerCartOverlay = document.getElementById('keranjang-drawer-overlay');
    state.drawerCart = document.getElementById('keranjang-drawer');
    state.barBawah = document.getElementById('keranjang-bar-bawah');

    // Listener tutup add to cart
    document.getElementById('tombol-tutup-add-cart')?.addEventListener('click', tutupAddCart);
    state.modalAddOverlay?.addEventListener('click', (e) => {
      if (e.target === state.modalAddOverlay) tutupAddCart();
    });

    // Listener tutup cart drawer
    document.getElementById('tombol-tutup-cart-drawer')?.addEventListener('click', tutupCart);
    state.drawerCartOverlay?.addEventListener('click', tutupCart);

    // Listener stepper add cart
    document.getElementById('add-cart-kurang')?.addEventListener('click', () => ubahQty(-1));
    document.getElementById('add-cart-tambah')?.addEventListener('click', () => ubahQty(1));

    // Listener varian warna
    document.querySelectorAll('.modal-add-cart__varian-item').forEach(btn => {
      btn.addEventListener('click', () => {
        state.varianAktif = btn.getAttribute('data-varian');
        updateVarianUI();
      });
    });

    // Listener submit add to cart
    document.getElementById('tombol-submit-add-cart')?.addEventListener('click', submitAddCart);

    // Listener bar bawah klik -> buka cart drawer
    state.barBawah?.addEventListener('click', bukaCart);

    // Esc key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.modalAddOverlay?.classList.contains('aktif')) tutupAddCart();
        if (state.drawerCart?.classList.contains('aktif')) tutupCart();
      }
    });

    render();
  }

  return {
    init,
    bukaAddCart,
    tutupAddCart,
    bukaCart,
    tutupCart,
    ambilItems,
  };
})();
