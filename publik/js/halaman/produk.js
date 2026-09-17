/**
 * Halaman Detail Produk (PDP) Controller - Vanilla JS
 * Kepatuhan /web-design-guidelines & /antislop-human
 * - Gallery Touch Swiper & Lightbox Zoom Modal
 * - Multi-Attribute Matrix (Karakter/Warna + Ukuran) & SKU Dynamic Tracker
 * - Exclusive Accordion (hanya 1 panel terbuka pada satu waktu)
 * - Integrasi Keranjang Belanja Global
 */

const ProdukDetail = (() => {
  let gambarList = [];
  let gambarIndex = 0;
  let varianData = [];
  let varianTerpilih = null;
  let ukuranTerpilih = null;
  let kuantitas = 1;
  let maxStok = 50;
  let hargaDasar = 0;
  let produkInfo = {};

  // Swipe gesture variables
  let touchStartX = 0;
  let touchEndX = 0;

  function init() {
    // Ambil data produk dari embedded JSON di halaman
    const dataEl = document.getElementById('pdp-data-produk');
    if (dataEl) {
      try {
        const parsed = JSON.parse(dataEl.textContent);
        produkInfo = parsed.produk || {};
        varianData = parsed.varian || [];
        hargaDasar = produkInfo.harga_diskon || produkInfo.harga || 0;
      } catch (err) {
        console.warn('Gagal membaca data produk:', err);
      }
    }

    // Inisialisasi daftar gambar galeri
    const thumbEls = document.querySelectorAll('.pdp__thumb-item');
    gambarList = Array.from(thumbEls).map(btn => btn.dataset.url || '');
    if (gambarList.length === 0 && produkInfo.gambar_utama) {
      gambarList = [produkInfo.gambar_utama];
    }

    initGaleri();
    initVarian();
    initStepper();
    initAccordion();
    initAksiBeli();
  }

  /* ==========================================================
     1. Galeri Gambar & Lightbox Zoom
     ========================================================== */
  function initGaleri() {
    const mainImg = document.getElementById('pdp-gambar-utama');
    const mainWadah = document.getElementById('pdp-gambar-viewport');
    const thumbBtns = document.querySelectorAll('.pdp__thumb-item');
    const zoomBtn = document.getElementById('pdp-tombol-zoom');
    const lightbox = document.getElementById('pdp-lightbox');
    const lightboxImg = document.getElementById('pdp-lightbox-img');
    const lightboxTutup = document.getElementById('pdp-lightbox-tutup');

    function gantiGambar(index) {
      if (index < 0 || index >= gambarList.length) return;
      gambarIndex = index;
      const targetUrl = gambarList[gambarIndex];

      if (mainImg) {
        mainImg.style.opacity = '0.5';
        setTimeout(() => {
          mainImg.src = targetUrl;
          mainImg.style.opacity = '1';
        }, 120);
      }

      thumbBtns.forEach((btn, i) => {
        if (i === index) {
          btn.classList.add('aktif');
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          btn.classList.remove('aktif');
        }
      });
    }

    thumbBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => gantiGambar(i));
    });

    // Touch Swipe pada gambar utama
    mainWadah?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    mainWadah?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && gambarIndex < gambarList.length - 1) {
          gantiGambar(gambarIndex + 1);
        } else if (diff < 0 && gambarIndex > 0) {
          gantiGambar(gambarIndex - 1);
        }
      }
    }, { passive: true });

    // Buka Lightbox Zoom
    function bukaLightbox() {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = gambarList[gambarIndex] || mainImg?.src || '';
      lightbox.classList.add('aktif');
      document.body.style.overflow = 'hidden';
    }

    function tutupLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('aktif');
      document.body.style.overflow = '';
    }

    mainWadah?.addEventListener('click', bukaLightbox);
    zoomBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      bukaLightbox();
    });

    lightboxTutup?.addEventListener('click', tutupLightbox);
    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) tutupLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox?.classList.contains('aktif')) {
        tutupLightbox();
      }
    });
  }

  /* ==========================================================
     2. Matriks Variasi SKU & Atribut
     ========================================================== */
  function initVarian() {
    const swatchBtns = document.querySelectorAll('.pdp__swatch-btn');
    const ukuranBtns = document.querySelectorAll('.pdp__ukuran-btn');
    const labelWarna = document.getElementById('pdp-varian-terpilih');
    const skuEl = document.getElementById('pdp-sku');
    const hargaAktifEl = document.getElementById('pdp-harga-aktif');
    const hargaMobileEl = document.getElementById('pdp-mobile-harga-nilai');

    // Pilih default pertama
    if (swatchBtns.length > 0) {
      varianTerpilih = swatchBtns[0].dataset.varian || '';
    }
    if (ukuranBtns.length > 0) {
      ukuranTerpilih = ukuranBtns[0].dataset.ukuran || '';
    }

    function perbaruiSKUDanHarga() {
      const matched = varianData.find(v => 
        v.nama_varian.toUpperCase() === (varianTerpilih || '').toUpperCase()
      ) || varianData[0];

      if (matched) {
        if (skuEl) skuEl.textContent = `SKU: ${matched.sku}`;
        const hargaTotal = hargaDasar + (matched.harga_tambahan || 0);
        const teksHarga = 'Rp ' + Number(hargaTotal).toLocaleString('id-ID');
        if (hargaAktifEl) hargaAktifEl.textContent = teksHarga;
        if (hargaMobileEl) hargaMobileEl.textContent = teksHarga;
        maxStok = matched.stok || 50;

        const stokInfoEl = document.getElementById('pdp-stok-info');
        if (stokInfoEl) {
          stokInfoEl.textContent = `Tersedia: ${maxStok} item`;
        }
      }
    }

    swatchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        swatchBtns.forEach(b => b.classList.remove('aktif'));
        btn.classList.add('aktif');
        varianTerpilih = btn.dataset.varian;
        if (labelWarna) labelWarna.textContent = varianTerpilih;
        perbaruiSKUDanHarga();
      });
    });

    ukuranBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        ukuranBtns.forEach(b => b.classList.remove('aktif'));
        btn.classList.add('aktif');
        ukuranTerpilih = btn.dataset.ukuran;
      });
    });

    perbaruiSKUDanHarga();
  }

  /* ==========================================================
     3. Kuantitas Stepper
     ========================================================== */
  function initStepper() {
    const minusBtn = document.getElementById('pdp-qty-minus');
    const plusBtn = document.getElementById('pdp-qty-plus');
    const inputQty = document.getElementById('pdp-qty-input');

    minusBtn?.addEventListener('click', () => {
      if (kuantitas > 1) {
        kuantitas--;
        if (inputQty) inputQty.value = kuantitas;
      }
    });

    plusBtn?.addEventListener('click', () => {
      if (kuantitas < maxStok) {
        kuantitas++;
        if (inputQty) inputQty.value = kuantitas;
      }
    });

    inputQty?.addEventListener('change', () => {
      let val = parseInt(inputQty.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > maxStok) val = maxStok;
      kuantitas = val;
      inputQty.value = kuantitas;
    });
  }

  /* ==========================================================
     4. Exclusive Accordion Component
     ========================================================== */
  function initAccordion() {
    const items = document.querySelectorAll('.pdp__accordion-item');

    items.forEach(item => {
      const header = item.querySelector('.pdp__accordion-header');
      header?.addEventListener('click', () => {
        const isAktif = item.classList.contains('aktif');

        // Tutup semua panel lain (Exclusive Accordion)
        items.forEach(other => {
          other.classList.remove('aktif');
          other.querySelector('.pdp__accordion-header')?.setAttribute('aria-expanded', 'false');
        });

        // Toggle panel yang diklik
        if (!isAktif) {
          item.classList.add('aktif');
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ==========================================================
     5. Aksi Masukkan Keranjang & Checkout
     ========================================================== */
  function initAksiBeli() {
    const btnKeranjangList = document.querySelectorAll('#pdp-btn-keranjang, #pdp-mobile-btn-cart');
    const btnBeliList = document.querySelectorAll('#pdp-btn-beli, #pdp-mobile-btn-buy');

    function prosesTambahKeranjang(langsungCheckout = false) {
      if (typeof Keranjang === 'undefined') return;

      const varianTeks = [varianTerpilih, ukuranTerpilih].filter(Boolean).join(' - ');

      const itemBaru = {
        id: produkInfo.id || 'crsl-pdp',
        nama: produkInfo.nama || 'CRSL Merchandise',
        harga: produkInfo.harga_diskon || produkInfo.harga || 179100,
        hargaCoret: produkInfo.harga || 199000,
        gambar: gambarList[0] || produkInfo.gambar_utama || '/aset/gambar/cassie-wallet.webp',
        varian: varianTeks || 'Default',
        jumlah: kuantitas
      };

      const existingItems = Keranjang.ambilItems ? Keranjang.ambilItems() : [];
      const idx = existingItems.findIndex(i => i.id === itemBaru.id && i.varian === itemBaru.varian);
      if (idx > -1) {
        existingItems[idx].jumlah += kuantitas;
      } else {
        existingItems.push(itemBaru);
      }

      if (Keranjang.simpanItems) {
        Keranjang.simpanItems(existingItems);
      }

      if (langsungCheckout) {
        window.location.href = '/checkout';
      } else {
        if (Keranjang.bukaCart) {
          Keranjang.bukaCart();
        }
      }
    }

    btnKeranjangList.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        prosesTambahKeranjang(false);
      });
    });

    btnBeliList.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        prosesTambahKeranjang(true);
      });
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  ProdukDetail.init();
});
