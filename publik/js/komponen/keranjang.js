/**
 * Keranjang Belanja - Cart State & Modals (Gambar 1, 2, 3, & 4)
 * Standar /antislop-ui, /antislop-code, /baseline-ui, & /007
 * - Drawer Samping Cart dengan Dukungan PRE ORDER & BUNDLED PRODUCT
 * - Sub-item Bundle List & Exclusion Notice Banner
 * - Trust Badges & Recently Ordered Quick-Add Carousel
 * - Dynamic Loyalty Progress Tier & Checkout with Discount
 * - Floating Bottom Capsule Bar dengan Live Badge Sync
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // Storage restricted
    }
    render();
  }

  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function hitungTotal() {
    let totalHarga = 0;
    let totalHargaAsli = 0;
    let totalItem = 0;

    state.items.forEach(item => {
      const hrg = item.harga || 0;
      const hrgAsli = item.hargaCoret || item.harga || 0;
      const jlh = item.jumlah || 1;
      totalHarga += hrg * jlh;
      totalHargaAsli += hrgAsli * jlh;
      totalItem += jlh;
    });

    const totalHemat = Math.max(0, totalHargaAsli - totalHarga);

    return {
      totalHarga,
      totalHargaAsli,
      totalHemat,
      totalItem,
    };
  }

  function bukaAddCart(produk) {
    state.produkAktif = produk || {
      id: 907117,
      nama: 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid | Compact & Stylish',
      harga: 179100,
      hargaCoret: 199000,
      gambar: '/aset/gambar/cassie-wallet.webp',
      varianPilihan: ['CHILO PINK', 'CHOCO BROWN']
    };
    state.varianAktif = state.produkAktif.varianPilihan ? state.produkAktif.varianPilihan[0] : 'CHILO PINK';
    state.qtyAktif = 1;

    const namaEl = document.getElementById('add-cart-nama');
    const thumbEl = document.getElementById('add-cart-thumb');
    const qtyEl = document.getElementById('add-cart-qty');
    const varianListEl = document.getElementById('modal-add-cart-varian-list');

    if (namaEl) namaEl.textContent = state.produkAktif.nama;
    if (thumbEl) thumbEl.src = state.produkAktif.gambar;
    if (qtyEl) qtyEl.textContent = '1';

    if (varianListEl && state.produkAktif.varianPilihan) {
      varianListEl.innerHTML = '';
      state.produkAktif.varianPilihan.forEach((v, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `modal-add-cart__varian-item ${idx === 0 ? 'terpilih' : ''}`;
        btn.setAttribute('data-varian', v);
        btn.innerHTML = `<span>${v}</span>`;
        btn.addEventListener('click', () => {
          state.varianAktif = v;
          updateVarianUI();
        });
        varianListEl.appendChild(btn);
      });
    }

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
        tipe: state.produkAktif.tipe || 'regular'
      });
    }

    simpanItems(items);
    tutupAddCart();

    if (typeof Pencarian !== 'undefined' && Pencarian.tutup) {
      Pencarian.tutup();
    }

    setTimeout(() => {
      bukaCart();
    }, 150);
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
        <div style="text-align: center; padding: 48px 20px; color: #64748b;">
          <p style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Keranjang Anda Masih Kosong</p>
          <p style="font-size: 0.88rem;">Pilih produk merchandise CRSL favorit Anda dan tambahkan ke sini.</p>
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

      const isPO = (item.tipe === 'pre_order' || (item.nama && item.nama.toLowerCase().includes('po ')));
      const isBundle = (item.tipe === 'bundle' || (item.nama && item.nama.toLowerCase().includes('bundle')) || item.isBundle);

      let tagHtml = '';
      if (isPO) {
        tagHtml = `<span class="keranjang-item__tag">PRE ORDER</span>`;
      } else if (isBundle) {
        tagHtml = `<span class="keranjang-item__tag">BUNDLED PRODUCT</span>`;
      }

      let subItemsHtml = '';
      if (isBundle) {
        subItemsHtml = `
          <div class="keranjang-bundle-subitems">
            <div class="keranjang-bundle-subitem">
              <img src="/aset/gambar/miflo-backpack-thumb.webp" class="keranjang-bundle-subitem__thumb" alt="Miflo Backpack">
              <div class="keranjang-bundle-subitem__info">
                <span class="keranjang-bundle-subitem__nama">CRSL Miflo Mini Backpack | Tas Gendong...</span>
                <span class="keranjang-bundle-subitem__varian">Popo | Pink</span>
              </div>
            </div>
            <div class="keranjang-bundle-subitem">
              <img src="/aset/gambar/ropy-keychain-thumb.webp" class="keranjang-bundle-subitem__thumb" alt="Ropy Keychain">
              <div class="keranjang-bundle-subitem__info">
                <span class="keranjang-bundle-subitem__nama">CRSL Ropy Colorful Keychain | Accessories...</span>
                <span class="keranjang-bundle-subitem__varian">Popo</span>
              </div>
            </div>
          </div>
          <div class="keranjang-bundle-banner">
            Bundled Product will be excluded from all other discount &amp; discount conditions.
          </div>
        `;
      }

      itemEl.innerHTML = `
        <div class="keranjang-item__atas">
          <div class="keranjang-item__media-kolom">
            <img src="${item.gambar}" alt="${item.nama}" class="keranjang-item__thumb">
            <div class="keranjang-item__info">
              ${tagHtml}
              <h4 class="keranjang-item__nama">${item.nama}</h4>
              <span class="keranjang-item__varian">${item.varian || 'Standard'}</span>
              <span class="keranjang-item__harga">${formatRupiah(item.harga)}</span>
            </div>
          </div>
        </div>
        ${subItemsHtml}
        <div class="keranjang-item__bawah">
          <button type="button" class="keranjang-item__hapus-btn" data-index="${index}">Remove</button>
          <div class="keranjang-item__stepper">
            <button type="button" class="keranjang-item__stepper-tombol kurang" data-index="${index}" aria-label="Kurangi kuantitas">&minus;</button>
            <span class="keranjang-item__stepper-angka">${item.jumlah}</span>
            <button type="button" class="keranjang-item__stepper-tombol tambah" data-index="${index}" aria-label="Tambah kuantitas">&plus;</button>
          </div>
        </div>
      `;

      wadah.appendChild(itemEl);
    });

    // Pasang listeners hapus & stepper
    wadah.querySelectorAll('.keranjang-item__hapus-btn').forEach(btn => {
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

    // Update total harga & baris hemat
    const total = hitungTotal();
    const totalLabel = document.getElementById('keranjang-total-label');
    const totalNilai = document.getElementById('keranjang-total-nilai');
    const hematBaris = document.getElementById('keranjang-hemat-baris');
    const hematNilai = document.getElementById('keranjang-hemat-nilai');

    if (totalLabel) totalLabel.textContent = `Total Price (${total.totalItem})`;
    if (totalNilai) totalNilai.textContent = formatRupiah(total.totalHarga);

    if (hematBaris && hematNilai) {
      if (total.totalHemat > 0) {
        hematBaris.style.display = 'flex';
        hematNilai.textContent = `Save ${formatRupiah(total.totalHemat)}`;
      } else {
        hematBaris.style.display = 'none';
      }
    }

    // Otomatisasi Voucher "FREEONGKIR10K" (Min. Spend Rp 179.000) (Screenshot 1 & 2)
    const MIN_VOUCHER_BELANJA = 179000;
    const voucherRow = document.getElementById('keranjang-voucher-row');
    const voucherNama = document.getElementById('keranjang-voucher-nama');
    if (total.totalHarga >= MIN_VOUCHER_BELANJA) {
      if (voucherRow) voucherRow.style.display = 'flex';
      if (voucherNama) {
        voucherNama.textContent = (typeof window.i18n !== 'undefined' && window.i18n.dapatkanBahasa && window.i18n.dapatkanBahasa() === 'en')
          ? 'Shipping Voucher Rp 10,000 Off Applied'
          : 'Voucher Diskon Ongkir Rp 10.000 Terpasang';
      }
      localStorage.setItem('crsl_applied_voucher', JSON.stringify({
        kode: 'FREEONGKIR10K',
        potongan: 10000,
        judul: 'Shipping: Rp 10,000 off'
      }));
    } else {
      if (voucherRow) voucherRow.style.display = 'none';
      localStorage.removeItem('crsl_applied_voucher');
    }

    // Update Progress Loyalitas "Spend 200K to unlock loyalty rewards!"
    const TARGET_LOYALTI = 200000; // Target Rp 200.000
    const sisaLoyalti = Math.max(0, TARGET_LOYALTI - total.totalHarga);
    const persentaseLoyalti = Math.min(100, Math.round((total.totalHarga / TARGET_LOYALTI) * 100));

    const loyaltyDesc = document.getElementById('keranjang-loyalty-desc');
    const loyaltyBar = document.getElementById('keranjang-loyalty-bar');
    const loyaltyFooterNote = document.getElementById('keranjang-loyalty-footer-note');

    const bahasa = (typeof window.i18n !== 'undefined' && window.i18n.dapatkanBahasa) ? window.i18n.dapatkanBahasa() : 'id';

    if (loyaltyDesc) {
      if (sisaLoyalti > 0) {
        if (bahasa === 'en') {
          loyaltyDesc.textContent = `Spend ${formatRupiah(sisaLoyalti)} more to unlock loyalty rewards!`;
        } else {
          loyaltyDesc.textContent = `Belanja ${formatRupiah(sisaLoyalti)} lagi untuk membuka reward loyalitas!`;
        }
      } else {
        if (bahasa === 'en') {
          loyaltyDesc.textContent = `🎉 Congratulations! Loyalty Rewards Unlocked!`;
        } else {
          loyaltyDesc.textContent = `🎉 Selamat! Reward Loyalitas Aktif!`;
        }
      }
    }

    if (loyaltyBar) {
      loyaltyBar.style.width = `${total.totalHarga > 0 ? Math.max(8, persentaseLoyalti) : 0}%`;
      if (sisaLoyalti === 0) {
        loyaltyBar.style.backgroundColor = '#16a34a';
      } else {
        loyaltyBar.style.backgroundColor = '';
      }
    }

    if (loyaltyFooterNote) {
      if (sisaLoyalti === 0) {
        loyaltyFooterNote.textContent = bahasa === 'en' ? '✅ Loyalty rewards unlocked for this order!' : '✅ Reward loyalitas aktif untuk pesanan ini!';
        loyaltyFooterNote.style.color = '#16a34a';
      } else {
        loyaltyFooterNote.textContent = bahasa === 'en' ? 'Spend 200K to unlock loyalty rewards!' : 'Belanja Rp 200.000 untuk membuka reward loyalitas!';
        loyaltyFooterNote.style.color = '';
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

  function initRecentlyOrderedQuickAdd() {
    const btns = document.querySelectorAll('.keranjang-mini-card__btn-add');
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = parseInt(btn.dataset.id, 10);
        const pNama = btn.dataset.nama || 'CRSL Item';
        const pHarga = parseInt(btn.dataset.harga, 10) || 179100;
        const pGambar = btn.dataset.gambar || '/aset/gambar/drinke-tumblr.webp';
        const pTipe = btn.dataset.tipe || 'regular';

        const items = ambilItems();
        const existing = items.find(i => i.id === pId);
        if (existing) {
          existing.jumlah += 1;
        } else {
          items.push({
            id: pId,
            nama: pNama,
            harga: pHarga,
            gambar: pGambar,
            varian: 'Standard',
            jumlah: 1,
            tipe: pTipe
          });
        }
        simpanItems(items);
        bukaCart();
      });
    });
  }

  function init() {
    state.items = ambilItems();

    state.modalAddOverlay = document.getElementById('modal-add-cart-overlay');
    state.modalAddCart = document.getElementById('modal-add-cart');
    state.drawerCartOverlay = document.getElementById('keranjang-drawer-overlay');
    state.drawerCart = document.getElementById('keranjang-drawer');
    state.barBawah = document.getElementById('keranjang-bar-bawah');

    document.getElementById('tombol-tutup-add-cart')?.addEventListener('click', tutupAddCart);
    state.modalAddOverlay?.addEventListener('click', (e) => {
      if (e.target === state.modalAddOverlay) tutupAddCart();
    });

    document.getElementById('tombol-tutup-cart-drawer')?.addEventListener('click', tutupCart);
    state.drawerCartOverlay?.addEventListener('click', tutupCart);

    document.getElementById('add-cart-kurang')?.addEventListener('click', () => ubahQty(-1));
    document.getElementById('add-cart-tambah')?.addEventListener('click', () => ubahQty(1));

    document.getElementById('tombol-submit-add-cart')?.addEventListener('click', submitAddCart);

    state.barBawah?.addEventListener('click', bukaCart);
    state.barBawah?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        bukaCart();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.modalAddOverlay?.classList.contains('aktif')) tutupAddCart();
        if (state.drawerCart?.classList.contains('aktif')) tutupCart();
      }
    });

    initRecentlyOrderedQuickAdd();
    render();
  }

  return {
    init,
    bukaAddCart,
    tutupAddCart,
    bukaCart,
    tutupCart,
    ambilItems,
    simpanItems,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Keranjang.init();
});
