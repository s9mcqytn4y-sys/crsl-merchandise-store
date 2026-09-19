/**
 * CRSL Merchandise Store - Multi-Step Checkout Controller
 * 3-Step Guided Wizard: Validasi Form Indonesia, Kalkulator Ongkir,
 * Voucher/Diskon Otomatis, Berat + Estimasi Tiba, Timer QRIS, Lifecycle Pesanan.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------
  // Stepper & Section Elements
  // -------------------------
  const tab1 = document.getElementById('stepper-tab-1');
  const tab2 = document.getElementById('stepper-tab-2');
  const tab3 = document.getElementById('stepper-tab-3');
  const sec1 = document.getElementById('checkout-step-1');
  const sec2 = document.getElementById('checkout-step-2');
  const sec3 = document.getElementById('checkout-step-3');

  const btnKeStep2  = document.getElementById('btn-ke-step-2');
  const btnKeStep3  = document.getElementById('btn-ke-step-3');
  const btnKembali1 = document.getElementById('btn-kembali-step-1');
  const btnKembali2 = document.getElementById('btn-kembali-step-2');
  const btnBayar    = document.getElementById('btn-bayar-sekarang');

  // Input Elements
  const inputNama     = document.getElementById('input-nama');
  const inputTelepon  = document.getElementById('input-telepon');
  const inputAlamat   = document.getElementById('input-alamat');
  const inputKodepos  = document.getElementById('input-kodepos');
  const inputKota     = document.getElementById('input-kota');
  const inputKecamatan = document.getElementById('input-kecamatan');
  const selectProvinsi = document.getElementById('select-provinsi');

  // Error Elements
  const errNama     = document.getElementById('error-nama');
  const errTelepon  = document.getElementById('error-telepon');
  const errAlamat   = document.getElementById('error-alamat');
  const errKodepos  = document.getElementById('error-kodepos');

  // Summary Elements
  const summaryList     = document.getElementById('checkout-daftar-item');
  const subtotalEl      = document.getElementById('kalkulasi-subtotal');
  const ongkirEl        = document.getElementById('kalkulasi-ongkir');
  const kurirLabelEl    = document.getElementById('kalkulasi-kurir-label');
  const layananEl       = document.getElementById('kalkulasi-layanan');
  const totalEl         = document.getElementById('kalkulasi-total');
  const beratEl         = document.getElementById('kalkulasi-berat');
  const estimasiEl      = document.getElementById('kalkulasi-estimasi');
  const diskonBaris     = document.getElementById('baris-diskon');
  const diskonEl        = document.getElementById('kalkulasi-diskon');
  const diskonLabelEl   = document.getElementById('kalkulasi-diskon-label');

  // Voucher Elements
  const inputVoucher       = document.getElementById('input-voucher');
  const btnTerapkanVoucher = document.getElementById('btn-terapkan-voucher');
  const voucherFeedback    = document.getElementById('voucher-feedback');

  // COD Warning
  const codWarning = document.getElementById('cod-warning');

  // Address Confirmation
  const konfirmasiAlamatTeks = document.getElementById('konfirmasi-alamat-teks');
  const ubahAlamatLink       = document.getElementById('ubah-alamat-link');

  // -------------------------
  // State
  // -------------------------
  let keranjang = [];
  try {
    keranjang = JSON.parse(localStorage.getItem('crsl_cart') || '[]');
  } catch (e) {
    keranjang = [];
  }

  // Demo cart jika kosong
  if (!keranjang || keranjang.length === 0) {
    keranjang = [{
      id: 'default-1',
      nama: 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita',
      harga: 179100,
      jumlah: 1,
      gambar: '/aset/gambar/cassie-wallet.webp',
      varian: 'CHILO PINK',
      tipe: 'regular',
      berat: 250,
    }];
    localStorage.setItem('crsl_cart', JSON.stringify(keranjang));
  }

  let ongkirTarif  = 18000;
  let ongkirNama   = 'JNE Reguler';
  let biayaLayanan = 3000;
  let subtotal     = 0;

  // Estimasi hari pengiriman per kurir
  const kurirEstimasi = {
    'JNE-REG':     { min: 2, max: 3, label: '2-3 Hari Kerja' },
    'JNE-YES':     { min: 1, max: 1, label: '1 Hari Kerja (Next Day)' },
    'SICEPAT-REG': { min: 2, max: 3, label: '2-3 Hari Kerja' },
    'JNT-EZ':      { min: 2, max: 3, label: '2-3 Hari Kerja' },
  };
  let kurirKode = 'JNE-REG';

  // Voucher state
  let activeVoucher = null; // { kode, tipe, nilai_diskon, judul }

  // -------------------------
  // Kalkulasi Total
  // -------------------------
  function hitungEstimasiTiba(kode) {
    const est = kurirEstimasi[kode] || { min: 2, max: 3 };
    const today = new Date();
    const addHariKerja = (date, hari) => {
      let d = new Date(date);
      let added = 0;
      while (added < hari) {
        d.setDate(d.getDate() + 1);
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) added++;
      }
      return d;
    };
    const mulai = addHariKerja(today, est.min);
    const selesai = addHariKerja(today, est.max);
    const opt = { day: 'numeric', month: 'short' };
    const fmt = d => d.toLocaleDateString('id-ID', opt);
    return est.min === est.max ? fmt(mulai) : `${fmt(mulai)} - ${fmt(selesai)}`;
  }

  function hitungBeratTotal() {
    return keranjang.reduce((acc, item) => acc + ((item.berat || 250) * (item.jumlah || 1)), 0);
  }

  function hitungTotal() {
    subtotal = keranjang.reduce((acc, item) => acc + (item.harga * (item.jumlah || 1)), 0);

    // Diskon voucher
    let diskonNominal = 0;
    let diskonOngkir  = 0;
    if (activeVoucher) {
      if (activeVoucher.tipe === 'ongkir') {
        diskonOngkir = Math.min(activeVoucher.nilai_diskon, ongkirTarif);
      } else {
        diskonNominal = activeVoucher.nilai_diskon;
      }
    }

    // Diskon otomatis: belanja > 200rb dapat 10%
    let diskonOtomatis = 0;
    if (!activeVoucher && subtotal >= 200000) {
      diskonOtomatis = Math.round(subtotal * 0.10);
    }

    const totalDiskon  = diskonNominal + diskonOtomatis;
    const ongkirFinal  = Math.max(0, ongkirTarif - diskonOngkir);
    const grandTotal   = Math.max(0, subtotal - totalDiskon + ongkirFinal + biayaLayanan);

    // Render
    if (subtotalEl) subtotalEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    if (ongkirEl)   ongkirEl.textContent   = `Rp ${ongkirFinal.toLocaleString('id-ID')}`;
    if (kurirLabelEl) kurirLabelEl.textContent = ongkirNama;
    if (layananEl)  layananEl.textContent  = `Rp ${biayaLayanan.toLocaleString('id-ID')}`;
    if (totalEl)    totalEl.textContent    = `Rp ${grandTotal.toLocaleString('id-ID')}`;

    // Berat
    const beratTotal = hitungBeratTotal();
    if (beratEl) beratEl.textContent = `${beratTotal.toLocaleString('id-ID')} gram`;

    // Estimasi tiba
    if (estimasiEl) estimasiEl.textContent = hitungEstimasiTiba(kurirKode);

    // Baris diskon
    const totalDiskonDisplay = totalDiskon + diskonOngkir;
    if (diskonBaris) {
      if (totalDiskonDisplay > 0) {
        diskonBaris.style.display = '';
        if (diskonEl) diskonEl.textContent = `-Rp ${totalDiskonDisplay.toLocaleString('id-ID')}`;
        if (diskonLabelEl) {
          if (activeVoucher) {
            diskonLabelEl.textContent = `Diskon Voucher (${activeVoucher.kode})`;
          } else if (diskonOtomatis > 0) {
            diskonLabelEl.textContent = 'Diskon Otomatis 10%';
          }
        }
      } else {
        diskonBaris.style.display = 'none';
      }
    }

    // Update tombol bayar
    const bayarLabel = document.getElementById('btn-bayar-label');
    if (bayarLabel) {
      bayarLabel.textContent = `Bayar Sekarang (Rp ${grandTotal.toLocaleString('id-ID')})`;
    }

    return { subtotal, totalDiskon, diskonOngkir, ongkirFinal, grandTotal };
  }

  // -------------------------
  // Render Ringkasan Keranjang
  // -------------------------
  function renderRingkasanKeranjang() {
    if (!summaryList) return;
    summaryList.innerHTML = '';

    keranjang.forEach(item => {
      const div = document.createElement('div');
      div.className = 'checkout-item-ringkas';
      const isPO = item.tipe === 'pre_order';
      div.innerHTML = `
        <img src="${item.gambar || '/aset/gambar/bundle-miflo-cover.webp'}" alt="${item.nama}" class="checkout-item-ringkas__thumb" loading="lazy">
        <div class="checkout-item-ringkas__info">
          <div class="checkout-item-ringkas__nama">${item.nama}${isPO ? ' <span class="badge-po">Pre-Order</span>' : ''}</div>
          <div class="checkout-item-ringkas__varian">${item.varian || 'Standar'} &times;${item.jumlah || 1}</div>
          ${isPO && item.estimasi_po ? `<div class="checkout-item-ringkas__po-info">Estimasi: ${item.estimasi_po}</div>` : ''}
        </div>
        <div class="checkout-item-ringkas__harga">Rp ${((item.harga || 0) * (item.jumlah || 1)).toLocaleString('id-ID')}</div>
      `;
      summaryList.appendChild(div);
    });

    hitungTotal();
  }

  renderRingkasanKeranjang();

  // -------------------------
  // Validasi Step 1
  // -------------------------
  function validasiStep1() {
    let valid = true;

    if (!inputNama?.value.trim() || inputNama.value.trim().length < 3) {
      if (errNama) errNama.style.display = 'block';
      valid = false;
    } else {
      if (errNama) errNama.style.display = 'none';
    }

    const telVal = inputTelepon?.value.trim() || '';
    if (!/^(\+62|62|0)8[0-9]{8,11}$/.test(telVal)) {
      if (errTelepon) errTelepon.style.display = 'block';
      valid = false;
    } else {
      if (errTelepon) errTelepon.style.display = 'none';
    }

    if (!inputKodepos?.value.trim() || !/^\d{5}$/.test(inputKodepos.value.trim())) {
      if (errKodepos) errKodepos.style.display = 'block';
      valid = false;
    } else {
      if (errKodepos) errKodepos.style.display = 'none';
    }

    if (!inputAlamat?.value.trim() || inputAlamat.value.trim().length < 8) {
      if (errAlamat) errAlamat.style.display = 'block';
      valid = false;
    } else {
      if (errAlamat) errAlamat.style.display = 'none';
    }

    return valid;
  }

  function updateKonfirmasiAlamat() {
    if (!konfirmasiAlamatTeks) return;
    const nama    = inputNama?.value.trim() || '-';
    const telepon = inputTelepon?.value.trim() || '-';
    const alamat  = inputAlamat?.value.trim() || '-';
    const kota    = inputKota?.value.trim() || '-';
    const kodepos = inputKodepos?.value.trim() || '-';
    konfirmasiAlamatTeks.textContent = `${nama} (${telepon}) - ${alamat}, ${kota} ${kodepos}`;
  }

  // -------------------------
  // Navigasi Langkah
  // -------------------------
  btnKeStep2?.addEventListener('click', () => {
    if (validasiStep1()) {
      sec1.style.display = 'none';
      sec2.style.display = 'block';
      tab1.classList.remove('checkout-step--aktif');
      tab1.classList.add('checkout-step--selesai');
      tab2.classList.add('checkout-step--aktif');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  btnKembali1?.addEventListener('click', () => {
    sec2.style.display = 'none';
    sec1.style.display = 'block';
    tab2.classList.remove('checkout-step--aktif');
    tab1.classList.add('checkout-step--aktif');
    tab1.classList.remove('checkout-step--selesai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Pilihan Kurir
  const kurirCards = document.querySelectorAll('.opsi-kurir-kartu');
  kurirCards.forEach(kartu => {
    kartu.addEventListener('click', () => {
      kurirCards.forEach(k => k.classList.remove('opsi-kurir-kartu--terpilih'));
      kartu.classList.add('opsi-kurir-kartu--terpilih');
      const radio = kartu.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        ongkirTarif = parseInt(radio.getAttribute('data-tarif'), 10) || 18000;
        ongkirNama  = radio.getAttribute('data-nama') || 'JNE Reguler';
        kurirKode   = radio.value || 'JNE-REG';
        hitungTotal();
      }
    });
  });

  // Asuransi Checkbox
  const checkAsuransi = document.getElementById('check-asuransi');
  checkAsuransi?.addEventListener('change', () => {
    biayaLayanan = checkAsuransi.checked ? 3000 : 1000;
    hitungTotal();
  });

  btnKeStep3?.addEventListener('click', () => {
    updateKonfirmasiAlamat();
    sec2.style.display = 'none';
    sec3.style.display = 'block';
    tab2.classList.remove('checkout-step--aktif');
    tab2.classList.add('checkout-step--selesai');
    tab3.classList.add('checkout-step--aktif');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mulaiTimerQRIS();
  });

  btnKembali2?.addEventListener('click', () => {
    sec3.style.display = 'none';
    sec2.style.display = 'block';
    tab3.classList.remove('checkout-step--aktif');
    tab2.classList.add('checkout-step--aktif');
    tab2.classList.remove('checkout-step--selesai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Ubah alamat link di Step 3
  ubahAlamatLink?.addEventListener('click', (e) => {
    e.preventDefault();
    sec3.style.display = 'none';
    sec2.style.display = 'none';
    sec1.style.display = 'block';
    tab3.classList.remove('checkout-step--aktif');
    tab2.classList.remove('checkout-step--selesai');
    tab1.classList.add('checkout-step--aktif');
    tab1.classList.remove('checkout-step--selesai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // -------------------------
  // Opsi Metode Bayar
  // -------------------------
  const bayarCards = document.querySelectorAll('.opsi-bayar-kartu');
  const qrisBox    = document.getElementById('qris-preview-box');

  bayarCards.forEach(kartu => {
    kartu.addEventListener('click', () => {
      bayarCards.forEach(k => k.classList.remove('opsi-bayar-kartu--terpilih'));
      kartu.classList.add('opsi-bayar-kartu--terpilih');
      const radio = kartu.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        if (radio.value === 'QRIS') {
          qrisBox?.classList.add('aktif');
          codWarning && (codWarning.style.display = 'none');
        } else if (radio.value === 'COD') {
          qrisBox?.classList.remove('aktif');
          codWarning && (codWarning.style.display = 'flex');
        } else {
          qrisBox?.classList.remove('aktif');
          codWarning && (codWarning.style.display = 'none');
        }
      }
    });
  });

  // -------------------------
  // Voucher
  // -------------------------
  async function terapkanVoucher() {
    const kode = inputVoucher?.value.trim().toUpperCase() || '';
    if (!kode) {
      tampilFeedbackVoucher('Masukkan kode voucher terlebih dahulu.', false);
      return;
    }

    const { subtotal: sub } = hitungTotal();

    btnTerapkanVoucher && (btnTerapkanVoucher.disabled = true);
    btnTerapkanVoucher && (btnTerapkanVoucher.textContent = 'Memeriksa...');

    try {
      const res = await fetch('/api/voucher/validasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kode, subtotal: sub })
      });
      const data = await res.json();

      if (data.sukses) {
        activeVoucher = data;
        tampilFeedbackVoucher(data.pesan, true);
        hitungTotal();
      } else {
        activeVoucher = null;
        tampilFeedbackVoucher(data.pesan || 'Voucher tidak valid.', false);
        hitungTotal();
      }
    } catch (e) {
      tampilFeedbackVoucher('Gagal menghubungi server. Coba lagi.', false);
    } finally {
      if (btnTerapkanVoucher) {
        btnTerapkanVoucher.disabled = false;
        btnTerapkanVoucher.textContent = 'Terapkan';
      }
    }
  }

  function tampilFeedbackVoucher(pesan, sukses) {
    if (!voucherFeedback) return;
    voucherFeedback.className = `checkout-voucher__feedback ${sukses ? 'checkout-voucher__feedback--sukses' : 'checkout-voucher__feedback--gagal'}`;
    voucherFeedback.textContent = pesan;
    voucherFeedback.style.display = pesan ? 'block' : 'none';
  }

  btnTerapkanVoucher?.addEventListener('click', terapkanVoucher);
  inputVoucher?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); terapkanVoucher(); }
  });

  // -------------------------
  // Timer QRIS
  // -------------------------
  let sisaWaktu = 15 * 60;
  let intervalTimer = null;
  let timerHabis = false;

  function mulaiTimerQRIS() {
    if (intervalTimer) clearInterval(intervalTimer);
    sisaWaktu = 15 * 60;
    timerHabis = false;
    const timerEl = document.getElementById('qris-countdown');
    if (!timerEl) return;

    intervalTimer = setInterval(() => {
      sisaWaktu--;
      if (sisaWaktu <= 0) {
        clearInterval(intervalTimer);
        timerHabis = true;
        timerEl.textContent = 'Waktu pembayaran habis. Pesanan dibatalkan otomatis.';
        timerEl.style.color = 'var(--warna-primer)';
        if (btnBayar) {
          btnBayar.disabled = true;
          btnBayar.style.opacity = '0.5';
        }
        return;
      }
      const menit = String(Math.floor(sisaWaktu / 60)).padStart(2, '0');
      const detik = String(sisaWaktu % 60).padStart(2, '0');
      timerEl.textContent = `Waktu tersisa: ${menit}:${detik}`;
      if (sisaWaktu <= 60) timerEl.style.color = 'var(--warna-primer)';
    }, 1000);
  }

  // -------------------------
  // Submit Pesanan
  // -------------------------
  const modalSimulasi    = document.getElementById('modal-simulator-bayar');
  const simulasiTotal    = document.getElementById('simulasi-total');
  const simulasiTimer    = document.getElementById('simulasi-timer');
  const btnSimulasiSukses = document.getElementById('btn-simulasi-sukses');
  const btnTutupSimulasi  = document.getElementById('btn-tutup-simulasi');

  let activeNomorPesanan = null;

  btnTutupSimulasi?.addEventListener('click', () => {
    if (activeNomorPesanan) {
      window.location.href = `/invoice/${encodeURIComponent(activeNomorPesanan)}`;
    } else {
      if (modalSimulasi) modalSimulasi.style.display = 'none';
    }
  });

  btnSimulasiSukses?.addEventListener('click', async () => {
    if (!activeNomorPesanan) return;
    btnSimulasiSukses.disabled = true;
    btnSimulasiSukses.textContent = 'Memverifikasi...';

    try {
      const res = await fetch('/api/pesanan/bayar-simulasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor_pesanan: activeNomorPesanan })
      });
      const data = await res.json();
      if (data.sukses) {
        // Update local orders
        const localOrders = JSON.parse(localStorage.getItem('crsl_orders') || '[]');
        const idx = localOrders.findIndex(o => o.id === activeNomorPesanan);
        if (idx !== -1) localOrders[idx].status = 'akan_dikirim';
        localStorage.setItem('crsl_orders', JSON.stringify(localOrders));

        btnSimulasiSukses.textContent = 'Pembayaran Sukses! Mengalihkan...';
        setTimeout(() => {
          window.location.href = `/invoice/${encodeURIComponent(activeNomorPesanan)}`;
        }, 800);
      } else {
        alert(data.pesan || 'Gagal memverifikasi pembayaran.');
        btnSimulasiSukses.disabled = false;
        btnSimulasiSukses.textContent = 'Coba Lagi';
      }
    } catch (e) {
      alert('Koneksi bermasalah: ' + e.message);
      btnSimulasiSukses.disabled = false;
      btnSimulasiSukses.textContent = 'Coba Lagi';
    }
  });

  btnBayar?.addEventListener('click', async () => {
    if (timerHabis) {
      alert('Waktu pembayaran sudah habis. Silakan mulai ulang pesanan.');
      return;
    }

    btnBayar.disabled = true;
    btnBayar.style.opacity = '0.7';
    btnBayar.innerHTML = '<span>Memeriksa Akun...</span>';

    // Cek login
    let currentUser = null;
    try {
      const authRes = await fetch('/api/auth/me');
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.sukses && authData.data) currentUser = authData.data;
      }
    } catch (e) {
      console.warn('Gagal cek auth:', e);
    }

    if (!currentUser) {
      btnBayar.disabled = false;
      btnBayar.style.opacity = '1';
      btnBayar.innerHTML = '<span>Masuk untuk Menyelesaikan Pesanan</span>';
      if (typeof Otentikasi !== 'undefined' && Otentikasi.bukaMasuk) {
        Otentikasi.bukaMasuk();
      } else {
        alert('Silakan login atau daftar akun terlebih dahulu.');
        window.location.href = '/akun';
      }
      return;
    }

    btnBayar.innerHTML = '<span>Membuat Pesanan...</span>';

    const radioBayar = document.querySelector('input[name="metode_bayar"]:checked');
    const metode     = radioBayar ? radioBayar.value : 'QRIS';

    const { subtotal: sub, totalDiskon, diskonOngkir, ongkirFinal, grandTotal } = hitungTotal();

    const payloadPesanan = {
      nama_lengkap:  inputNama?.value.trim() || currentUser.nama_lengkap,
      telepon:       inputTelepon?.value.trim() || '08xxxxxxxxxx',
      alamat_lengkap: inputAlamat?.value.trim() || 'Jl. -',
      kota:          inputKota?.value.trim() || 'Yogyakarta',
      kode_pos:      inputKodepos?.value.trim() || '00000',
      kurir:         ongkirNama,
      ongkir:        ongkirFinal,
      metode_bayar:  metode,
      kode_voucher:  activeVoucher ? activeVoucher.kode : '',
      items:         keranjang,
    };

    try {
      const res = await fetch('/api/pesanan/buat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadPesanan)
      });
      const data = await res.json();

      if (data.sukses && data.pesanan) {
        activeNomorPesanan = data.pesanan.nomor_pesanan;

        // Simpan backup lokal
        const localOrders = JSON.parse(localStorage.getItem('crsl_orders') || '[]');
        localOrders.unshift({
          id:           activeNomorPesanan,
          tanggal:      new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
          nama:         payloadPesanan.nama_lengkap,
          telepon:      payloadPesanan.telepon,
          alamat:       payloadPesanan.alamat_lengkap,
          kurir:        ongkirNama,
          ongkir:       ongkirFinal,
          subtotal:     sub,
          diskon:       totalDiskon + diskonOngkir,
          total:        data.pesanan.total,
          metode:       metode,
          kode_voucher: activeVoucher?.kode || null,
          status:       'belum_bayar',
          waktu_kedaluwarsa: data.pesanan.waktu_kedaluwarsa,
          items:        keranjang,
        });
        localStorage.setItem('crsl_orders', JSON.stringify(localOrders));

        // Bersihkan keranjang
        localStorage.removeItem('crsl_cart');

        // Buka modal simulator
        if (modalSimulasi) {
          if (simulasiTotal) simulasiTotal.textContent = `Total: Rp ${data.pesanan.total.toLocaleString('id-ID')}`;
          modalSimulasi.style.display = 'flex';
          modalSimulasi.classList.add('aktif');

          // Countdown modal
          let countdown = 15 * 60;
          const timerSimulasi = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
              clearInterval(timerSimulasi);
              if (simulasiTimer) simulasiTimer.textContent = 'Masa pembayaran berakhir.';
              return;
            }
            const m = String(Math.floor(countdown / 60)).padStart(2, '0');
            const s = String(countdown % 60).padStart(2, '0');
            if (simulasiTimer) simulasiTimer.textContent = `Waktu tersisa: ${m}:${s}`;
          }, 1000);
        } else {
          window.location.href = `/invoice/${encodeURIComponent(activeNomorPesanan)}`;
        }
      } else {
        alert(data.pesan || 'Terjadi kendala saat membuat pesanan.');
        btnBayar.disabled = false;
        btnBayar.style.opacity = '1';
        btnBayar.innerHTML = '<span>Bayar Sekarang</span>';
      }
    } catch (err) {
      alert('Gagal menghubungi server: ' + err.message);
      btnBayar.disabled = false;
      btnBayar.style.opacity = '1';
      btnBayar.innerHTML = '<span>Bayar Sekarang</span>';
    }
  });
});
