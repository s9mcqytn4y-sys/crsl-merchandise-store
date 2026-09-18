/**
 * Halaman Detail Produk (PDP) Controller - Vanilla JS
 * Standar /antislop-ui, /antislop-code, /baseline-ui, & /007
 * - Thumbnail Gallery Switching dengan Animasi Geser Kanan-ke-Kiri
 * - Smooth Cursor-Following Hardware Accelerated Zoom
 * - Matriks SKU Dinamis, Auto-Mute Ukuran Habis, dan Notifikasi Restock
 * - Modal Pop-up Kupon Diskon dengan Expandable T&C Accordion
 * - Kalkulator Estimasi Ongkir Dinamis & WhatsApp CTA Integration
 * - Baris [You Might Also Like] & [Recent Viewed] LocalStorage Tracking
 */

const ProdukDetail = (() => {
  let produkData = {};
  let varianList = [];
  let semuaProdukLookup = [];

  let warnaTerpilih = null;
  let ukuranTerpilih = null;
  let varianAktif = null;
  let kuantitas = 1;
  let maxStok = 50;

  function init() {
    // 1. Baca payload JSON produk dari embedded script tag
    const dataEl = document.getElementById('pdp-data-produk');
    if (dataEl) {
      try {
        const parsed = JSON.parse(dataEl.textContent);
        produkData = parsed.produk || {};
        varianList = parsed.varian || [];
        semuaProdukLookup = parsed.semuaProduk || [];
      } catch (err) {
        console.warn('Gagal memproses data JSON produk:', err);
      }
    }

    // 2. Inisialisasi setiap modul komponen
    initGaleriDanZoom();
    initVarianDanSKU();
    initStepper();
    initDeskripsiViewMore();
    initDeliveryEstimator();
    initModalDiskon();
    initAksiBeli();
    initCarouselNav();
    initRecentViewed();
  }

  /* ==========================================================
     1. Galeri Thumbnail & Cursor Zoom (Kolom 1 & 2)
     ========================================================== */
  function initGaleriDanZoom() {
    const thumbBtns = document.querySelectorAll('.pdp__thumb-btn');
    const mainImg = document.getElementById('pdp-gambar-fokus');
    const zoomViewport = document.getElementById('pdp-zoom-viewport');
    const btnExpand = document.getElementById('pdp-btn-expand');
    const lightbox = document.getElementById('pdp-lightbox');
    const lightboxImg = document.getElementById('pdp-lightbox-img');
    const lightboxTutup = document.getElementById('pdp-lightbox-tutup');

    // Klik thumbnail ganti gambar dengan animasi kanan-ke-kiri
    thumbBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (!url || !mainImg) return;

        thumbBtns.forEach(b => {
          b.classList.remove('aktif');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('aktif');
        btn.setAttribute('aria-selected', 'true');

        // Picu animasi kanan ke kiri
        mainImg.classList.remove('geser-kiri');
        void mainImg.offsetWidth; // trigger reflow
        mainImg.src = url;
        mainImg.classList.add('geser-kiri');
      });
    });

    // Smooth Cursor-Following Zoom pada Kolom 2
    if (zoomViewport && mainImg) {
      zoomViewport.addEventListener('mousemove', (e) => {
        const rect = zoomViewport.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        mainImg.style.transformOrigin = `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
        mainImg.style.transform = 'scale(2.2)';
      });

      zoomViewport.addEventListener('mouseleave', () => {
        mainImg.style.transform = 'scale(1)';
        mainImg.style.transformOrigin = 'center center';
      });
    }

    // Lightbox modal fullscreen
    function bukaLightbox() {
      if (!lightbox || !lightboxImg || !mainImg) return;
      lightboxImg.src = mainImg.src;
      lightbox.classList.add('aktif');
      document.body.style.overflow = 'hidden';
    }

    function tutupLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('aktif');
      document.body.style.overflow = '';
    }

    btnExpand?.addEventListener('click', (e) => {
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
     2. Matriks Varian SKU, Warna & Ukuran (Kolom 3)
     ========================================================== */
  function initVarianDanSKU() {
    const swatchBtns = document.querySelectorAll('.pdp__swatch-box');
    const ukuranBtns = document.querySelectorAll('.pdp__ukuran-kotak');
    const warnaLabel = document.getElementById('pdp-warna-terpilih-nama');
    const ukuranLabel = document.getElementById('pdp-ukuran-terpilih-nama');
    const stokKeterangan = document.getElementById('pdp-stok-keterangan');
    const restockNotif = document.getElementById('pdp-restock-notif');
    const btnAddCart = document.getElementById('pdp-btn-add-cart');
    const btnBuyNow = document.getElementById('pdp-btn-buy-now');
    const mainImg = document.getElementById('pdp-gambar-fokus');

    // Tentukan pilihan awal
    if (swatchBtns.length > 0) {
      const aktifSwatch = document.querySelector('.pdp__swatch-box.aktif') || swatchBtns[0];
      warnaTerpilih = aktifSwatch.dataset.warna || null;
      if (warnaLabel) warnaLabel.textContent = warnaTerpilih;
    }

    if (ukuranBtns.length > 0) {
      const aktifUkuran = document.querySelector('.pdp__ukuran-kotak.aktif:not(.habis)');
      if (aktifUkuran) {
        ukuranTerpilih = aktifUkuran.dataset.ukuran;
        if (ukuranLabel) ukuranLabel.textContent = ukuranTerpilih;
      }
    }

    function evaluasiKetersediaan() {
      // Cari varian yang cocok di matriks
      let matched = varianList.find(v => {
        const wMatch = !warnaTerpilih || (v.warna || v.nama_varian).toUpperCase() === warnaTerpilih.toUpperCase();
        const uMatch = !ukuranTerpilih || (v.ukuran || v.atribut_ukuran).toUpperCase() === ukuranTerpilih.toUpperCase();
        return wMatch && uMatch;
      });

      if (!matched && varianList.length > 0) {
        matched = varianList.find(v => (v.warna || v.nama_varian).toUpperCase() === (warnaTerpilih || '').toUpperCase()) || varianList[0];
      }

      varianAktif = matched;
      maxStok = matched ? (parseInt(matched.stok, 10) || 0) : 50;

      const habis = maxStok <= 0;

      if (habis) {
        if (stokKeterangan) {
          stokKeterangan.textContent = 'Stok Habis';
          stokKeterangan.style.color = '#dc2626';
        }
        if (restockNotif) restockNotif.style.display = 'flex';
        if (btnAddCart) {
          btnAddCart.disabled = true;
          btnAddCart.textContent = 'Stok Habis';
        }
        if (btnBuyNow) {
          btnBuyNow.disabled = true;
        }
      } else {
        if (stokKeterangan) {
          stokKeterangan.textContent = `Tersedia: ${maxStok} item`;
          stokKeterangan.style.color = '#16a34a';
        }
        if (restockNotif) restockNotif.style.display = 'none';
        if (btnAddCart) {
          btnAddCart.disabled = false;
          btnAddCart.textContent = 'Add to Cart';
        }
        if (btnBuyNow) {
          btnBuyNow.disabled = false;
        }
      }

      // Sesuaikan kuantitas jika melebihi stok
      const stepInput = document.getElementById('pdp-step-input');
      if (stepInput && kuantitas > maxStok && maxStok > 0) {
        kuantitas = maxStok;
        stepInput.value = kuantitas;
      }
    }

    // Event listener pemilihan warna
    swatchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        swatchBtns.forEach(b => {
          b.classList.remove('aktif');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('aktif');
        btn.setAttribute('aria-checked', 'true');

        warnaTerpilih = btn.dataset.warna;
        if (warnaLabel) warnaLabel.textContent = warnaTerpilih;

        // Ganti gambar fokus jika varian punya gambar tersendiri
        const gbrVarian = btn.dataset.gambar;
        if (gbrVarian && mainImg && mainImg.src !== gbrVarian) {
          mainImg.src = gbrVarian;
          mainImg.classList.remove('geser-kiri');
          void mainImg.offsetWidth;
          mainImg.classList.add('geser-kiri');
        }

        // Hapus pesan error jika ada
        const errEl = document.getElementById('pdp-warna-error');
        if (errEl) errEl.style.display = 'none';

        evaluasiKetersediaan();
      });
    });

    // Event listener pemilihan ukuran
    ukuranBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled || btn.classList.contains('habis')) return;

        ukuranBtns.forEach(b => {
          b.classList.remove('aktif');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('aktif');
        btn.setAttribute('aria-checked', 'true');

        ukuranTerpilih = btn.dataset.ukuran;
        if (ukuranLabel) ukuranLabel.textContent = ukuranTerpilih;

        evaluasiKetersediaan();
      });
    });

    // Tombol ingatkan restock
    document.getElementById('pdp-btn-ingatkan')?.addEventListener('click', () => {
      alert(`Kami akan mengirimkan notifikasi saat ukuran ${ukuranTerpilih || ''} varian ${warnaTerpilih || ''} kembali tersedia!`);
    });

    evaluasiKetersediaan();
  }

  /* ==========================================================
     3. Stepper Kuantitas
     ========================================================== */
  function initStepper() {
    const minusBtn = document.getElementById('pdp-step-minus');
    const plusBtn = document.getElementById('pdp-step-plus');
    const input = document.getElementById('pdp-step-input');

    minusBtn?.addEventListener('click', () => {
      if (kuantitas > 1) {
        kuantitas--;
        if (input) input.value = kuantitas;
      }
    });

    plusBtn?.addEventListener('click', () => {
      if (kuantitas < maxStok) {
        kuantitas++;
        if (input) input.value = kuantitas;
      }
    });
  }

  /* ==========================================================
     4. Deskripsi Produk dengan UX "View more / View less"
     ========================================================== */
  function initDeskripsiViewMore() {
    const btnToggle = document.getElementById('pdp-btn-view-more');
    const konten = document.getElementById('pdp-desc-konten');

    btnToggle?.addEventListener('click', () => {
      const isCiut = konten?.classList.contains('ciut');
      if (isCiut) {
        konten?.classList.remove('ciut');
        btnToggle.classList.add('terbuka');
        btnToggle.querySelector('span').textContent = 'View less';
        btnToggle.setAttribute('aria-expanded', 'true');
      } else {
        konten?.classList.add('ciut');
        btnToggle.classList.remove('terbuka');
        btnToggle.querySelector('span').textContent = 'View more';
        btnToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ==========================================================
     5. Kalkulator Ongkir Pengiriman (Delivery Estimator)
     ========================================================== */
  function initDeliveryEstimator() {
    const selectKota = document.getElementById('pdp-select-kota');
    const tarifReguler = document.getElementById('pdp-tarif-reguler');
    const tarifExpress = document.getElementById('pdp-tarif-express');

    const daftarTarif = {
      jogja: { reguler: 'Rp 0 (Gratis Ongkir)', express: 'Rp 8.000' },
      jakarta: { reguler: 'Rp 10.000', express: 'Rp 18.000' },
      bandung: { reguler: 'Rp 12.000', express: 'Rp 20.000' },
      surabaya: { reguler: 'Rp 12.000', express: 'Rp 22.000' },
      luarjawa: { reguler: 'Rp 28.000', express: 'Rp 45.000' }
    };

    selectKota?.addEventListener('change', () => {
      const val = selectKota.value;
      const data = daftarTarif[val] || daftarTarif.jakarta;
      if (tarifReguler) tarifReguler.textContent = data.reguler;
      if (tarifExpress) tarifExpress.textContent = data.express;
    });
  }

  /* ==========================================================
     6. Modal Kupon Diskon & T&C Accordion (Gambar 5)
     ========================================================== */
  function initModalDiskon() {
    const triggerKupon = document.getElementById('pdp-buka-kupon');
    const overlay = document.getElementById('pdp-modal-diskon-overlay');
    const btnTutup = document.getElementById('pdp-btn-tutup-diskon');
    const btnTcToggle = document.getElementById('pdp-btn-tc-toggle');
    const tcIsi = document.getElementById('pdp-tc-isi');
    const btnKlaim = document.getElementById('pdp-btn-klaim-kupon');

    function bukaModal() {
      if (!overlay) return;
      overlay.classList.add('aktif');
      document.body.style.overflow = 'hidden';
    }

    function tutupModal() {
      if (!overlay) return;
      overlay.classList.remove('aktif');
      document.body.style.overflow = '';
    }

    triggerKupon?.addEventListener('click', bukaModal);
    triggerKupon?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        bukaModal();
      }
    });

    btnTutup?.addEventListener('click', tutupModal);
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) tutupModal();
    });

    btnTcToggle?.addEventListener('click', () => {
      btnTcToggle.classList.toggle('terbuka');
      tcIsi?.classList.toggle('terbuka');
    });

    btnKlaim?.addEventListener('click', () => {
      try {
        localStorage.setItem('crsl_active_coupon', JSON.stringify({
          kode: 'SHIP10K',
          potongan: 10000,
          deskripsi: 'Potongan Ongkir Rp 10.000'
        }));
      } catch (e) {
        // Storage restricted
      }
      alert('Kupon potongan ongkir Rp 10.000 berhasil diaktifkan untuk pesanan Anda!');
      tutupModal();
    });
  }

  /* ==========================================================
     7. Aksi Masukkan Keranjang & Checkout Langsung
     ========================================================== */
  function initAksiBeli() {
    const btnCartList = document.querySelectorAll('#pdp-btn-add-cart, #pdp-mobile-btn-cart');
    const btnBuyList = document.querySelectorAll('#pdp-btn-buy-now, #pdp-mobile-btn-buy');

    function prosesPemesanan(langsungCheckout = false) {
      if (maxStok <= 0) {
        alert('Maaf, varian produk ini sedang tidak tersedia.');
        return;
      }

      // Validasi pemilihan warna jika ada opsi
      const swatchBtns = document.querySelectorAll('.pdp__swatch-box');
      if (swatchBtns.length > 0 && !warnaTerpilih) {
        const errEl = document.getElementById('pdp-warna-error');
        if (errEl) errEl.style.display = 'block';
        errEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const mainImg = document.getElementById('pdp-gambar-fokus');
      const varianLabelGabungan = [warnaTerpilih, ukuranTerpilih].filter(Boolean).join(' - ') || 'Default';

      const itemBaru = {
        id: produkData.id || 907117,
        sku: varianAktif?.sku || `CRSL-${produkData.id || 'ITEM'}`,
        nama: produkData.nama || 'CRSL Merchandise',
        harga: produkData.harga_diskon || produkData.harga || 179100,
        hargaCoret: produkData.harga || 199000,
        gambar: mainImg?.src || produkData.gambar_utama || '/aset/gambar/cassie-wallet.webp',
        varian: varianLabelGabungan,
        jumlah: kuantitas,
        tipe: produkData.tipe_produk || 'regular',
        statusStok: produkData.status_stok || 'in_stock'
      };

      if (typeof Keranjang !== 'undefined') {
        const existing = Keranjang.ambilItems ? Keranjang.ambilItems() : [];
        const idx = existing.findIndex(i => i.id === itemBaru.id && i.varian === itemBaru.varian);
        if (idx > -1) {
          existing[idx].jumlah += kuantitas;
        } else {
          existing.push(itemBaru);
        }

        if (Keranjang.simpanItems) {
          Keranjang.simpanItems(existing);
        }

        if (langsungCheckout) {
          window.location.href = '/checkout';
        } else {
          if (Keranjang.bukaCart) {
            Keranjang.bukaCart();
          }
        }
      } else {
        if (langsungCheckout) {
          window.location.href = '/checkout';
        }
      }
    }

    btnCartList.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        prosesPemesanan(false);
      });
    });

    btnBuyList.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        prosesPemesanan(true);
      });
    });
  }

  /* ==========================================================
     8. Navigasi Carousel Horizontal (< >)
     ========================================================== */
  function initCarouselNav() {
    const setupTrack = (trackId, prevId, nextId) => {
      const track = document.getElementById(trackId);
      const prev = document.getElementById(prevId);
      const next = document.getElementById(nextId);

      prev?.addEventListener('click', () => {
        track?.scrollBy({ left: -240, behavior: 'smooth' });
      });

      next?.addEventListener('click', () => {
        track?.scrollBy({ left: 240, behavior: 'smooth' });
      });
    };

    setupTrack('pdp-rekomendasi-track', 'pdp-rekomendasi-prev', 'pdp-rekomendasi-next');
    setupTrack('pdp-recent-track', 'pdp-recent-prev', 'pdp-recent-next');
  }

  /* ==========================================================
     9. Logika Riwayat Kunjungan [Recent Viewed] LocalStorage
     ========================================================== */
  function initRecentViewed() {
    if (!produkData.id) return;

    const STORAGE_KEY = 'crsl_recent_pdp_history';
    let riwayat = [];

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) riwayat = JSON.parse(raw);
    } catch {
      riwayat = [];
    }

    // 1. Tambahkan produk saat ini ke daftar riwayat (tanpa duplikasi)
    const produkItem = {
      id: produkData.id,
      nama: produkData.nama,
      slug: produkData.slug,
      harga: produkData.harga,
      harga_diskon: produkData.harga_diskon,
      gambar: produkData.gambar_utama || '/aset/gambar/cassie-wallet.webp',
      tipe_produk: produkData.tipe_produk || 'regular',
      kategori: produkData.nama_kategori || 'Merchandise'
    };

    riwayat = riwayat.filter(p => p.id !== produkItem.id);
    riwayat.unshift(produkItem);
    if (riwayat.length > 8) riwayat.pop();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(riwayat));
    } catch {
      // Storage restricted
    }

    // 2. Render item yang sebelumnya dilihat ke track #pdp-recent-track
    const recentSection = document.getElementById('pdp-recent-section');
    const recentTrack = document.getElementById('pdp-recent-track');
    const itemLain = riwayat.filter(p => p.id !== produkItem.id);

    if (itemLain.length > 0 && recentTrack && recentSection) {
      recentTrack.innerHTML = '';
      itemLain.forEach(p => {
        const hargaTampil = p.harga_diskon || p.harga;
        const adaDiskon = p.harga_diskon && p.harga_diskon < p.harga;

        const card = document.createElement('article');
        card.className = 'pdp__card-katalog';
        card.innerHTML = `
          <a href="/products/${p.id}/${encodeURIComponent(p.slug)}" class="pdp__card-media">
            <img src="${p.gambar}" alt="${p.nama}" loading="lazy" width="220" height="220">
            ${adaDiskon ? `<span class="pdp__card-badge-diskon">${Math.round((1 - p.harga_diskon / p.harga) * 100)}% OFF</span>` : ''}
          </a>
          <div class="pdp__card-info">
            <span class="pdp__card-kategori">${p.kategori || 'Merchandise'}</span>
            <h3 class="pdp__card-nama">
              <a href="/products/${p.id}/${encodeURIComponent(p.slug)}">${p.nama}</a>
            </h3>
            <div class="pdp__card-harga">
              <span class="pdp__card-harga-aktif">Rp ${Number(hargaTampil).toLocaleString('id-ID')}</span>
              ${adaDiskon ? `<span class="pdp__card-harga-coret">Rp ${Number(p.harga).toLocaleString('id-ID')}</span>` : ''}
            </div>
          </div>
        `;
        recentTrack.appendChild(card);
      });
      recentSection.style.display = 'block';
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  ProdukDetail.init();
});
