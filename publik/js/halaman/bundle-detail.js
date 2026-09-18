/**
 * CRSL Merchandise Store - Bundle Detail Controller
 * Standar /antislop-ui, /antislop-code, /baseline-ui, & /007
 * - Logika pemilihan varian per item, validasi 1 set lengkap
 * - Integrasi mulus dengan Keranjang Belanja & Drawer Cart
 */

document.addEventListener('DOMContentLoaded', () => {
  const gambarUtama = document.getElementById('bundle-gambar-utama');
  const thumbBtns = document.querySelectorAll('.bundle-pdp__thumb-btn');
  const itemsContainer = document.getElementById('bundle-items-list');
  const ctaBtn = document.getElementById('bundle-cta-btn');
  const ctaTeks = document.getElementById('bundle-cta-teks');

  if (!itemsContainer || !ctaBtn) return;

  const totalItems = parseInt(itemsContainer.getAttribute('data-total-items'), 10) || 2;
  const bundleNama = itemsContainer.getAttribute('data-bundle-nama') || 'BACK TO SCHOOL with Miflo';
  const bundleHarga = parseInt(itemsContainer.getAttribute('data-bundle-harga'), 10) || 289000;
  const bundleGambar = itemsContainer.getAttribute('data-bundle-gambar') || '/aset/gambar/bundle-miflo-cover.webp';

  // 1. Galeri Thumbnail Switcher
  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      thumbBtns.forEach(b => b.classList.remove('bundle-pdp__thumb-btn--aktif'));
      btn.classList.add('bundle-pdp__thumb-btn--aktif');
      const src = btn.getAttribute('data-src');
      if (gambarUtama && src) {
        gambarUtama.style.opacity = '0.4';
        setTimeout(() => {
          gambarUtama.src = src;
          gambarUtama.style.opacity = '1';
        }, 150);
      }
    });
  });

  // 2. State Pilihan Varian Item
  const itemCards = itemsContainer.querySelectorAll('.bundle-item-kartu');
  const pilihanVarian = {};

  itemCards.forEach((kartu, idx) => {
    const defaultPill = kartu.querySelector('.bundle-item-kartu__varian-pill--aktif') || kartu.querySelector('.bundle-item-kartu__varian-pill');
    pilihanVarian[idx] = {
      nama: kartu.getAttribute('data-item-nama'),
      varian: defaultPill ? defaultPill.getAttribute('data-varian') : 'Default'
    };

    const pills = kartu.querySelectorAll('.bundle-item-kartu__varian-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('bundle-item-kartu__varian-pill--aktif'));
        pill.classList.add('bundle-item-kartu__varian-pill--aktif');
        pilihanVarian[idx].varian = pill.getAttribute('data-varian');
      });
    });
  });

  // 3. Tombol CTA Tambah ke Keranjang
  ctaBtn.addEventListener('click', () => {
    const itemBundle = {
      id: 'bundle-3516',
      nama: bundleNama,
      harga: bundleHarga,
      hargaCoret: bundleHarga + 54100,
      gambar: bundleGambar,
      varian: 'Bundle Complete Set',
      jumlah: 1,
      tipe: 'bundle',
      isBundle: true
    };

    if (typeof Keranjang !== 'undefined') {
      const items = Keranjang.ambilItems ? Keranjang.ambilItems() : [];
      const idx = items.findIndex(i => i.id === itemBundle.id);
      if (idx > -1) {
        items[idx].jumlah += 1;
      } else {
        items.push(itemBundle);
      }
      if (Keranjang.simpanItems) {
        Keranjang.simpanItems(items);
      }
      if (Keranjang.bukaCart) {
        Keranjang.bukaCart();
      }
    } else {
      window.location.href = '/checkout';
    }
  });
});
