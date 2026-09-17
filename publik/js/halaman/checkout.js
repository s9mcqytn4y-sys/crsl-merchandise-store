/**
 * CRSL Merchandise Store - Multi-Step Checkout Controller
 * 3-Step Guided Wizard, Validasi Form Indonesia, Kalkulator Ongkir, & Timer QRIS
 */

document.addEventListener('DOMContentLoaded', () => {
  // Stepper Elements
  const tab1 = document.getElementById('stepper-tab-1');
  const tab2 = document.getElementById('stepper-tab-2');
  const tab3 = document.getElementById('stepper-tab-3');

  const sec1 = document.getElementById('checkout-step-1');
  const sec2 = document.getElementById('checkout-step-2');
  const sec3 = document.getElementById('checkout-step-3');

  const btnKeStep2 = document.getElementById('btn-ke-step-2');
  const btnKeStep3 = document.getElementById('btn-ke-step-3');
  const btnKembali1 = document.getElementById('btn-kembali-step-1');
  const btnKembali2 = document.getElementById('btn-kembali-step-2');
  const btnBayar = document.getElementById('btn-bayar-sekarang');

  // Input Elements
  const inputNama = document.getElementById('input-nama');
  const inputTelepon = document.getElementById('input-telepon');
  const inputAlamat = document.getElementById('input-alamat');
  const inputKodepos = document.getElementById('input-kodepos');

  // Errors
  const errNama = document.getElementById('error-nama');
  const errTelepon = document.getElementById('error-telepon');
  const errAlamat = document.getElementById('error-alamat');
  const errKodepos = document.getElementById('error-kodepos');

  // Kalkulasi Summary Elements
  const summaryList = document.getElementById('checkout-daftar-item');
  const subtotalEl = document.getElementById('kalkulasi-subtotal');
  const ongkirEl = document.getElementById('kalkulasi-ongkir');
  const kurirLabelEl = document.getElementById('kalkulasi-kurir-label');
  const layananEl = document.getElementById('kalkulasi-layanan');
  const totalEl = document.getElementById('kalkulasi-total');

  // State Pesanan
  let keranjang = [];
  try {
    keranjang = JSON.parse(localStorage.getItem('crsl_cart') || '[]');
  } catch (e) {
    keranjang = [];
  }

  // Jika keranjang kosong, beri item default agar checkout tetap dapat didemokan
  if (!keranjang || keranjang.length === 0) {
    keranjang = [
      {
        id: 'default-1',
        nama: 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita',
        harga: 179100,
        jumlah: 1,
        gambar: '/aset/gambar/cassie-wallet.webp',
        varian: 'CHILO PINK'
      }
    ];
    localStorage.setItem('crsl_cart', JSON.stringify(keranjang));
  }

  let ongkirTarif = 18000;
  let ongkirNama = 'JNE Reguler';
  let biayaLayanan = 3000; // Asuransi 2000 + Sistem 1000
  let subtotal = 0;

  function hitungTotal() {
    subtotal = keranjang.reduce((acc, item) => acc + (item.harga * item.jumlah), 0);
    const grandTotal = subtotal + ongkirTarif + biayaLayanan;

    subtotalEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    ongkirEl.textContent = `Rp ${ongkirTarif.toLocaleString('id-ID')}`;
    kurirLabelEl.textContent = ongkirNama;
    layananEl.textContent = `Rp ${biayaLayanan.toLocaleString('id-ID')}`;
    totalEl.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;

    const bayarLabel = document.getElementById('btn-bayar-label');
    if (bayarLabel) {
      bayarLabel.textContent = `Bayar Sekarang (Rp ${grandTotal.toLocaleString('id-ID')})`;
    }
  }

  function renderRingkasanKeranjang() {
    if (!summaryList) return;
    summaryList.innerHTML = '';

    keranjang.forEach(item => {
      const div = document.createElement('div');
      div.className = 'checkout-item-ringkas';
      div.innerHTML = `
        <img src="${item.gambar}" alt="${item.nama}" class="checkout-item-ringkas__thumb">
        <div class="checkout-item-ringkas__info">
          <div class="checkout-item-ringkas__nama">${item.nama}</div>
          <div class="checkout-item-ringkas__varian">${item.varian || 'Standar'} (x${item.jumlah})</div>
        </div>
        <div class="checkout-item-ringkas__harga">Rp ${(item.harga * item.jumlah).toLocaleString('id-ID')}</div>
      `;
      summaryList.appendChild(div);
    });

    hitungTotal();
  }

  renderRingkasanKeranjang();

  // Validasi Step 1
  function validasiStep1() {
    let valid = true;

    if (!inputNama.value.trim() || inputNama.value.trim().length < 3) {
      errNama.style.display = 'block';
      valid = false;
    } else {
      errNama.style.display = 'none';
    }

    const telVal = inputTelepon.value.trim();
    if (!/^(\+62|62|0)8[0-9]{8,11}$/.test(telVal)) {
      errTelepon.style.display = 'block';
      valid = false;
    } else {
      errTelepon.style.display = 'none';
    }

    if (!inputKodepos.value.trim() || !/^\d{5}$/.test(inputKodepos.value.trim())) {
      errKodepos.style.display = 'block';
      valid = false;
    } else {
      errKodepos.style.display = 'none';
    }

    if (!inputAlamat.value.trim() || inputAlamat.value.trim().length < 8) {
      errAlamat.style.display = 'block';
      valid = false;
    } else {
      errAlamat.style.display = 'none';
    }

    return valid;
  }

  // Navigasi Langkah
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
        ongkirNama = radio.getAttribute('data-nama') || 'JNE Reguler';
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

  // Opsi Bayar
  const bayarCards = document.querySelectorAll('.opsi-bayar-kartu');
  const qrisBox = document.getElementById('qris-preview-box');

  bayarCards.forEach(kartu => {
    kartu.addEventListener('click', () => {
      bayarCards.forEach(k => k.classList.remove('opsi-bayar-kartu--terpilih'));
      kartu.classList.add('opsi-bayar-kartu--terpilih');
      const radio = kartu.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        if (radio.value === 'QRIS') {
          qrisBox.classList.add('aktif');
        } else {
          qrisBox.classList.remove('aktif');
        }
      }
    });
  });

  // Timer QRIS 15:00
  let sisaWaktu = 15 * 60;
  let intervalTimer = null;

  function mulaiTimerQRIS() {
    if (intervalTimer) clearInterval(intervalTimer);
    const timerEl = document.getElementById('qris-countdown');
    if (!timerEl) return;

    intervalTimer = setInterval(() => {
      if (sisaWaktu <= 0) {
        clearInterval(intervalTimer);
        timerEl.textContent = 'Batas waktu pembayaran telah habis';
        return;
      }
      sisaWaktu--;
      const menit = String(Math.floor(sisaWaktu / 60)).padStart(2, '0');
      const detik = String(sisaWaktu % 60).padStart(2, '0');
      timerEl.textContent = `Waktu tersisa: ${menit}:${detik}`;
    }, 1000);
  }

  // Submit Pembayaran Final
  btnBayar?.addEventListener('click', () => {
    btnBayar.disabled = true;
    btnBayar.style.opacity = '0.7';
    btnBayar.innerHTML = `<span>Memproses Pesanan...</span>`;

    const nomorPesanan = 'CRSL-ORD-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(1000 + Math.random() * 9000);
    const radioBayar = document.querySelector('input[name="metode_bayar"]:checked');
    const metode = radioBayar ? radioBayar.value : 'QRIS';

    const pesananData = {
      id: nomorPesanan,
      tanggal: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      nama: inputNama.value.trim() || 'Pelanggan CRSL',
      telepon: inputTelepon.value.trim() || '081234567890',
      alamat: inputAlamat.value.trim() || 'Yogyakarta',
      kurir: ongkirNama,
      ongkir: ongkirTarif,
      biayaLayanan: biayaLayanan,
      subtotal: subtotal,
      total: subtotal + ongkirTarif + biayaLayanan,
      metode: metode,
      status: metode === 'COD' ? 'diproses' : 'menunggu_pembayaran',
      items: keranjang
    };

    // Simpan pesanan ke daftar pesanan pengguna
    const daftarPesanan = JSON.parse(localStorage.getItem('crsl_orders') || '[]');
    daftarPesanan.unshift(pesananData);
    localStorage.setItem('crsl_orders', JSON.stringify(daftarPesanan));

    // Kosongkan keranjang belanja
    localStorage.removeItem('crsl_cart');

    // Arahkan ke Invoice / Bukti Pemesanan
    setTimeout(() => {
      window.location.href = `/invoice/${nomorPesanan}`;
    }, 800);
  });
});
