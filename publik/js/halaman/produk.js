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
          stokKeterangan.textContent = '';
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

        // Hapus kelas shake-error jika ada
        document.querySelector('.pdp__sec-warna')?.classList.remove('shake-error');

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

        // Hapus kelas shake-error jika ada
        document.querySelector('.pdp__sec-ukuran')?.classList.remove('shake-error');

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
     5. Multi-Step Address Modal & Courier Estimator (Gambar 1, 2, 3, 4, 5)
     ========================================================== */
  function initDeliveryEstimator() {
    // Dataset Wilayah Indonesia (Provinsi > Kota/Kab > Kecamatan)
    const dataWilayah = {
      'Bali': {
        'Kota Denpasar': ['Denpasar Barat', 'Denpasar Selatan', 'Denpasar Timur', 'Denpasar Utara'],
        'Kab. Badung': ['Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi'],
        'Kab. Gianyar': ['Gianyar', 'Sukawati', 'Ubud']
      },
      'Bangka Belitung': {
        'Kota Pangkalpinang': ['Bukit Intan', 'Gerunggang', 'Pangkal Balam', 'Rangkui'],
        'Kab. Bangka': ['Sungai Liat', 'Belinyu', 'Mendo Barat']
      },
      'Banten': {
        'Kota Tangerang': ['Batuceper', 'Ciledug', 'Cipondoh', 'Karawaci', 'Tangerang'],
        'Kota Tangerang Selatan': ['Ciputat', 'Pamulang', 'Pondok Aren', 'Serpong', 'Serpong Utara'],
        'Kota Serang': ['Serang', 'Cipocok Jaya', 'Kasemen'],
        'Kota Cilegon': ['Cilegon', 'Cibeber', 'Grogol']
      },
      'Bengkulu': {
        'Kota Bengkulu': ['Gading Cempaka', 'Ratu Agung', 'Ratu Samban', 'Teluk Segara'],
        'Kab. Rejang Lebong': ['Curup', 'Curup Tengah', 'Curup Timur']
      },
      'DI Yogyakarta': {
        'Kota Yogyakarta': ['Danurejan', 'Gedongtengen', 'Gondokusuman', 'Gondomanan', 'Kotagede', 'Malioboro', 'Mergangsan', 'Umbulharjo', 'Wirobrajan'],
        'Kab. Sleman': ['Depok', 'Gamping', 'Mlati', 'Ngaglik', 'Sleman'],
        'Kab. Bantul': ['Banguntapan', 'Bantul', 'Kasihan', 'Sewon'],
        'Kab. Kulon Progo': ['Wates', 'Sentolo', 'Pengasih'],
        'Kab. Gunungkidul': ['Wonosari', 'Playen', 'Karangmojo']
      },
      'DKI Jakarta': {
        'Kab. Kepulauan Seribu': ['Kepulauan Seribu Selatan', 'Kepulauan Seribu Utara'],
        'Kota Jakarta Barat': ['Cengkareng', 'Grogol Petamburan', 'Kalideres', 'Kebon Jeruk', 'Kembangan', 'Palmerah', 'Taman Sari', 'Tambora'],
        'Kota Jakarta Pusat': ['Cempaka Putih', 'Gambir', 'Johar Baru', 'Kemayoran', 'Menteng', 'Sawah Besar', 'Senen', 'Tanah Abang'],
        'Kota Jakarta Selatan': ['Cilandak', 'Jagakarsa', 'Kebayoran Baru', 'Kebayoran Lama', 'Mampang Prapatan', 'Pancoran', 'Pasar Minggu', 'Pesanggrahan', 'Setiabudi', 'Tebet'],
        'Kota Jakarta Timur': ['Cakung', 'Cipayung', 'Ciracas', 'Duren Sawit', 'Jatinegara', 'Kramat Jati', 'Makasar', 'Matraman', 'Pasar Rebo', 'Pulo Gadung'],
        'Kota Jakarta Utara': ['Cilincing', 'Kelapa Gading', 'Koja', 'Pademangan', 'Penjaringan', 'Tanjung Priok']
      },
      'Gorontalo': {
        'Kota Gorontalo': ['Dumbo Raya', 'Dungingi', 'Kota Barat', 'Kota Selatan', 'Kota Tengah'],
        'Kab. Gorontalo': ['Limboto', 'Telaga', 'Tibawa']
      },
      'Jawa Barat': {
        'Kota Bandung': ['Andir', 'Astanaanyar', 'Coblong', 'Lengkong', 'Sukasari', 'Sumur Bandung'],
        'Kota Bekasi': ['Bekasi Barat', 'Bekasi Selatan', 'Bekasi Timur', 'Bekasi Utara', 'Pondok Gede'],
        'Kota Bogor': ['Bogor Barat', 'Bogor Selatan', 'Bogor Tengah', 'Bogor Timur', 'Bogor Utara'],
        'Kota Depok': ['Beji', 'Cimanggis', 'Cinere', 'Pancoran Mas', 'Sukmajaya']
      },
      'Jawa Tengah': {
        'Kota Semarang': ['Banyumanik', 'Candisari', 'Gajahmungkur', 'Pedurungan', 'Semarang Barat', 'Semarang Selatan', 'Semarang Tengah'],
        'Kota Surakarta': ['Banjarsari', 'Jebres', 'Laweyan', 'Pasar Kliwon', 'Serengan'],
        'Kota Magelang': ['Magelang Selatan', 'Magelang Tengah', 'Magelang Utara']
      },
      'Jawa Timur': {
        'Kota Surabaya': ['Gubeng', 'Mulyorejo', 'Rungkut', 'Sawahan', 'Sukolilo', 'Tegalsari', 'Wonokromo'],
        'Kota Malang': ['Blimbing', 'Kedungkandang', 'Klojen', 'Lowokwaru', 'Sukun'],
        'Kota Sidoarjo': ['Candi', 'Gedangan', 'Sidoarjo', 'Waru']
      }
    };

    // Elemen DOM Kontainer Delivery
    const btnPilihAlamat = document.getElementById('pdp-btn-pilih-alamat');
    const teksAlamatTujuan = document.getElementById('pdp-teks-alamat-tujuan');
    const btnCekOngkir = document.getElementById('pdp-btn-cek-ongkir');
    const teksOngkir = document.getElementById('pdp-teks-ongkir');
    const ikonOngkirInfo = document.getElementById('pdp-ikon-ongkir-info');
    const popoverKurir = document.getElementById('pdp-popover-kurir');
    const btnTutupKurir = document.getElementById('pdp-btn-tutup-kurir');
    const kurirListContainer = document.getElementById('pdp-kurir-list');

    // Elemen DOM Modal Bertingkat
    const modalOverlay = document.getElementById('pdp-modal-alamat-overlay');
    const btnCloseModal = document.getElementById('pdp-alamat-btn-close');
    const btnBackModal = document.getElementById('pdp-alamat-btn-back');
    const stepTitle = document.getElementById('pdp-modal-alamat-step-title');
    const subtitle = document.getElementById('pdp-alamat-subtitle');
    const searchInput = document.getElementById('pdp-alamat-search-input');
    const listContainer = document.getElementById('pdp-alamat-list-items');

    // State Pemilihan Alamat
    let activeStep = 1; // 1: Province, 2: City, 3: Area
    let selectedProv = '';
    let selectedCity = '';
    let selectedArea = '';
    let selectedCourier = null;

    // Berat Produk Aktual dalam Gram (default 500g jika tidak tersedia)
    const beratProduk = parseInt(produkData.berat, 10) || 500;
    const kgMultiplier = Math.max(1, Math.ceil(beratProduk / 1000));

    // Ambil data alamat yang tersimpan sebelumnya (User Story: jika user sebelumnya sudah submit)
    const STORAGE_KEY_ADDR = 'crsl_shipping_destination';
    const STORAGE_KEY_COURIER = 'crsl_selected_courier';

    function hitungTarifKurir(prov, city) {
      // Menghitung tarif pengiriman realistis berbasis zona tujuan dan berat
      let baseReg = 16000;
      let baseFast = 28000;
      let baseSicepat = 15000;
      let baseJnt = 16000;

      if (prov === 'DI Yogyakarta') {
        baseReg = 8000;
        baseFast = 15000;
        baseSicepat = 8000;
        baseJnt = 9000;
      } else if (prov === 'DKI Jakarta') {
        baseReg = 16000;
        baseFast = 28000;
        baseSicepat = 15000;
        baseJnt = 16000;
      } else if (prov === 'Banten' || prov === 'Jawa Barat') {
        baseReg = 14000;
        baseFast = 24000;
        baseSicepat = 14000;
        baseJnt = 15000;
      } else if (prov === 'Jawa Tengah' || prov === 'Jawa Timur') {
        baseReg = 12000;
        baseFast = 22000;
        baseSicepat = 12000;
        baseJnt = 13000;
      } else {
        baseReg = 28000;
        baseFast = 48000;
        baseSicepat = 27000;
        baseJnt = 28000;
      }

      return [
        {
          id: 'jne-reg',
          namaKurir: 'JNE',
          logo: '/aset/ikon/kurir-jne.svg',
          layanan: 'Reguler (2-3 hari)',
          tarif: baseReg * kgMultiplier,
          badge: 'Rekomendasi'
        },
        {
          id: 'jne-yes',
          namaKurir: 'JNE',
          logo: '/aset/ikon/kurir-jne.svg',
          layanan: 'YES (Yakin Esok Sampai) (1 hari)',
          tarif: baseFast * kgMultiplier,
          badge: 'Express'
        },
        {
          id: 'sicepat-reg',
          namaKurir: 'SiCepat',
          logo: '/aset/ikon/kurir-sicepat.svg',
          layanan: 'Reguler (2-3 hari)',
          tarif: baseSicepat * kgMultiplier,
          badge: 'Hemat'
        },
        {
          id: 'jnt-ez',
          namaKurir: 'J&T',
          logo: '/aset/ikon/kurir-jnt.svg',
          layanan: 'EZ Reguler (2-3 hari)',
          tarif: baseJnt * kgMultiplier,
          badge: 'Cepat'
        }
      ];
    }

    function renderKurirOptions(options) {
      if (!kurirListContainer) return;
      kurirListContainer.innerHTML = '';

      options.forEach(opt => {
        const isAktif = selectedCourier && selectedCourier.id === opt.id;
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `pdp__kurir-card ${isAktif ? 'aktif' : ''}`;
        card.setAttribute('role', 'option');
        card.setAttribute('aria-selected', isAktif ? 'true' : 'false');
        card.innerHTML = `
          <div class="pdp__kurir-logo-col">
            <img src="${opt.logo}" alt="${opt.namaKurir}" width="72" height="28" loading="lazy">
          </div>
          <div class="pdp__kurir-info-col">
            <div class="pdp__kurir-baris-nominal">Rp ${opt.tarif.toLocaleString('id-ID')}</div>
            <div class="pdp__kurir-baris-layanan">${opt.layanan}</div>
          </div>
        `;

        card.addEventListener('click', () => {
          selectedCourier = opt;
          try {
            localStorage.setItem(STORAGE_KEY_COURIER, JSON.stringify(opt));
          } catch {}

          // Update teks pada Baris 2 PDP
          if (teksOngkir) teksOngkir.textContent = `Rp ${opt.tarif.toLocaleString('id-ID')}`;
          if (ikonOngkirInfo) ikonOngkirInfo.style.display = 'inline-flex';

          tutupPopoverKurir();
        });

        kurirListContainer.appendChild(card);
      });
    }

    function formatAlamatDisplay(kota, area) {
      // Format ringkas sesuai screenshot: "Jakarta Pusat, Johar Baru ˅"
      let cleanKota = kota.replace(/^Kota\s+|^Kab\.\s+/i, '');
      return `${cleanKota}, ${area}`;
    }

    function perbaruiTampilanPDP() {
      if (selectedArea && selectedCity) {
        if (teksAlamatTujuan) {
          teksAlamatTujuan.textContent = formatAlamatDisplay(selectedCity, selectedArea);
        }

        const options = hitungTarifKurir(selectedProv, selectedCity);
        renderKurirOptions(options);

        // Pilih opsi pertama (JNE Reguler) jika belum ada kurir terpilih
        if (!selectedCourier) {
          selectedCourier = options[0];
        } else {
          // Cari opsi yang setara
          const match = options.find(o => o.id === selectedCourier.id);
          selectedCourier = match || options[0];
        }

        if (teksOngkir) {
          teksOngkir.textContent = `Rp ${selectedCourier.tarif.toLocaleString('id-ID')}`;
        }
        if (ikonOngkirInfo) {
          ikonOngkirInfo.style.display = 'inline-flex';
        }
      } else {
        if (teksAlamatTujuan) {
          teksAlamatTujuan.textContent = 'Pilih Alamat Pengiriman';
        }
        if (teksOngkir) {
          teksOngkir.textContent = 'Check Delivery Cost';
        }
        if (ikonOngkirInfo) {
          ikonOngkirInfo.style.display = 'none';
        }
      }
    }

    // Cek data tersimpan di LocalStorage
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY_ADDR);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved.prov && saved.city && saved.area) {
          selectedProv = saved.prov;
          selectedCity = saved.city;
          selectedArea = saved.area;
        }
      }
      const savedCourierRaw = localStorage.getItem(STORAGE_KEY_COURIER);
      if (savedCourierRaw) {
        selectedCourier = JSON.parse(savedCourierRaw);
      }
    } catch {}

    perbaruiTampilanPDP();

    /* ----------------------------------------------------
       Modal Controller (3 Steps: Province -> City -> Area)
       ---------------------------------------------------- */
    function bukaModalAlamat() {
      if (!modalOverlay) return;
      modalOverlay.classList.add('aktif');
      document.body.style.overflow = 'hidden';
      if (btnPilihAlamat) btnPilihAlamat.setAttribute('aria-expanded', 'true');
      renderStep(activeStep);
    }

    function tutupModalAlamat() {
      if (!modalOverlay) return;
      modalOverlay.classList.remove('aktif');
      document.body.style.overflow = '';
      if (btnPilihAlamat) btnPilihAlamat.setAttribute('aria-expanded', 'false');
    }

    function bukaPopoverKurir() {
      if (!selectedArea) {
        // Fallback: jika belum ada alamat, buka modal alamat terlebih dahulu
        bukaModalAlamat();
        return;
      }
      if (!popoverKurir) return;
      popoverKurir.style.display = 'block';
      if (btnCekOngkir) btnCekOngkir.setAttribute('aria-expanded', 'true');
    }

    function tutupPopoverKurir() {
      if (!popoverKurir) return;
      popoverKurir.style.display = 'none';
      if (btnCekOngkir) btnCekOngkir.setAttribute('aria-expanded', 'false');
    }

    function renderStep(step) {
      activeStep = step;
      if (!searchInput || !listContainer || !stepTitle || !subtitle || !btnBackModal) return;

      listContainer.innerHTML = '';
      searchInput.value = '';

      // Back button hanya muncul di Step 2 dan Step 3
      btnBackModal.style.display = (step > 1) ? 'inline-flex' : 'none';

      let items = [];

      if (step === 1) {
        stepTitle.textContent = '1. Pick Province';
        subtitle.textContent = 'Send package to which address?';
        searchInput.placeholder = 'Search Province';
        items = Object.keys(dataWilayah);

      } else if (step === 2) {
        stepTitle.textContent = '2. Pick City';
        subtitle.textContent = `${selectedProv} :`;
        searchInput.placeholder = 'Search City';
        const kotaObj = dataWilayah[selectedProv] || {};
        items = Object.keys(kotaObj);

      } else if (step === 3) {
        stepTitle.textContent = '3. Pick Area';
        subtitle.textContent = `${selectedProv}, ${selectedCity} :`;
        searchInput.placeholder = 'Search Area';
        const areaArr = (dataWilayah[selectedProv] && dataWilayah[selectedProv][selectedCity]) || [];
        items = areaArr;
      }

      function populateList(filterText = '') {
        listContainer.innerHTML = '';
        const q = filterText.trim().toLowerCase();
        const filtered = items.filter(it => it.toLowerCase().includes(q));

        if (filtered.length === 0) {
          const empty = document.createElement('div');
          empty.style.padding = '16px';
          empty.style.color = '#9ca3af';
          empty.style.fontSize = '13px';
          empty.textContent = 'Wilayah tidak ditemukan';
          listContainer.appendChild(empty);
          return;
        }

        filtered.forEach(it => {
          const row = document.createElement('button');
          row.type = 'button';
          row.className = 'pdp__modal-alamat-item';
          row.innerHTML = `
            <span>${it}</span>
            <span class="pdp__modal-alamat-item-chevron">&rsaquo;</span>
          `;

          row.addEventListener('click', () => {
            if (activeStep === 1) {
              selectedProv = it;
              renderStep(2);
            } else if (activeStep === 2) {
              selectedCity = it;
              renderStep(3);
            } else if (activeStep === 3) {
              selectedArea = it;

              // Simpan ke storage
              try {
                localStorage.setItem(STORAGE_KEY_ADDR, JSON.stringify({
                  prov: selectedProv,
                  city: selectedCity,
                  area: selectedArea
                }));
              } catch {}

              perbaruiTampilanPDP();
              tutupModalAlamat();
            }
          });

          listContainer.appendChild(row);
        });
      }

      populateList();

      // Realtime search filtering
      searchInput.oninput = (e) => {
        populateList(e.target.value);
      };
      searchInput.focus();
    }

    // Event listener navigasi modal
    btnPilihAlamat?.addEventListener('click', bukaModalAlamat);
    btnCloseModal?.addEventListener('click', tutupModalAlamat);
    modalOverlay?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) tutupModalAlamat();
    });

    btnBackModal?.addEventListener('click', () => {
      if (activeStep === 3) {
        renderStep(2);
      } else if (activeStep === 2) {
        renderStep(1);
      }
    });

    // Event listener popover kurir
    btnCekOngkir?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (popoverKurir && popoverKurir.style.display === 'block') {
        tutupPopoverKurir();
      } else {
        bukaPopoverKurir();
      }
    });

    ikonOngkirInfo?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (popoverKurir && popoverKurir.style.display === 'block') {
        tutupPopoverKurir();
      } else {
        bukaPopoverKurir();
      }
    });

    btnTutupKurir?.addEventListener('click', (e) => {
      e.stopPropagation();
      tutupPopoverKurir();
    });

    document.addEventListener('click', (e) => {
      if (popoverKurir && !popoverKurir.contains(e.target) && e.target !== btnCekOngkir && !btnCekOngkir?.contains(e.target)) {
        tutupPopoverKurir();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        tutupModalAlamat();
        tutupPopoverKurir();
      }
    });
  }

  /* ==========================================================
     6. Modal Kupon Diskon & T&C Accordion (Screenshot 1)
     ========================================================== */
  function initModalDiskon() {
    const triggerKupon = document.getElementById('btn-buka-discounts') || document.getElementById('pdp-buka-kupon');
    const overlay = document.getElementById('modal-discounts-overlay') || document.getElementById('pdp-modal-diskon-overlay');
    const btnTutup = document.getElementById('btn-close-discounts') || document.getElementById('pdp-btn-tutup-diskon');
    const tcToggle = document.getElementById('modal-discounts-tc-toggle') || document.getElementById('pdp-btn-tc-toggle');
    const tcContent = document.getElementById('modal-discounts-tc-content') || document.getElementById('pdp-tc-isi');

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
    btnTutup?.addEventListener('click', tutupModal);
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) tutupModal();
    });

    tcToggle?.addEventListener('click', () => {
      const isExpanded = tcToggle.getAttribute('aria-expanded') === 'true';
      tcToggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
      if (tcContent) {
        tcContent.style.display = isExpanded ? 'none' : 'block';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay?.classList.contains('aktif')) {
        tutupModal();
      }
    });
  }

  /* Helper Toast Notifikasi PDP */
  function tampilkanPdpToast(pesan) {
    const toast = document.getElementById('pdp-toast');
    if (!toast) {
      alert(pesan);
      return;
    }
    toast.textContent = pesan;
    toast.classList.add('aktif');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('aktif');
    }, 2800);
  }

  /* ==========================================================
     7. Aksi Masukkan Keranjang & Checkout Langsung
     ========================================================== */
  function initAksiBeli() {
    const btnCartList = document.querySelectorAll('#pdp-btn-add-cart, #pdp-mobile-btn-cart');
    const btnBuyList = document.querySelectorAll('#pdp-btn-buy-now, #pdp-mobile-btn-buy');

    function prosesPemesanan(langsungCheckout = false) {
      if (maxStok <= 0) {
        tampilkanPdpToast('Maaf, varian produk ini sedang tidak tersedia.');
        return;
      }

      // 1. Validasi Wajib Pilih Ukuran (jika produk punya opsi ukuran)
      const ukuranBtns = document.querySelectorAll('.pdp__ukuran-kotak');
      if (ukuranBtns.length > 0 && !ukuranTerpilih) {
        const secUkuran = document.querySelector('.pdp__sec-ukuran');
        if (secUkuran) {
          secUkuran.classList.remove('shake-error');
          void secUkuran.offsetWidth; // Reflow trigger
          secUkuran.classList.add('shake-error');
          secUkuran.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        tampilkanPdpToast('Silakan pilih Ukuran terlebih dahulu untuk melanjutkan.');
        return;
      }

      // 2. Validasi Wajib Pilih Warna (jika produk punya opsi warna)
      const swatchBtns = document.querySelectorAll('.pdp__swatch-box');
      if (swatchBtns.length > 0 && !warnaTerpilih) {
        const secWarna = document.querySelector('.pdp__sec-warna');
        if (secWarna) {
          secWarna.classList.remove('shake-error');
          void secWarna.offsetWidth;
          secWarna.classList.add('shake-error');
          secWarna.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        tampilkanPdpToast('Silakan pilih Warna terlebih dahulu untuk melanjutkan.');
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
        const card = track?.querySelector('.pdp__card-katalog');
        const scrollAmount = card ? (card.offsetWidth + 16) * 2 : 280;
        track?.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      next?.addEventListener('click', () => {
        const card = track?.querySelector('.pdp__card-katalog');
        const scrollAmount = card ? (card.offsetWidth + 16) * 2 : 280;
        track?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
