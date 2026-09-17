/**
 * Otentikasi - Login, Register, & Verify Accounts Controller
 * Mendukung validasi inline, switch modal, timer resend, dan restorasi old_value
 */

const Otentikasi = (() => {
  let modalMasuk = null;
  let modalDaftar = null;
  let modalVerifikasi = null;

  let timerInterval = null;
  let sisaWaktu = 59;

  // Penyimpanan old_values formulir registrasi
  let oldValues = {
    nama: '',
    email: '',
    sandi: '',
    hari: '',
    bulan: '',
    tahun: '',
  };

  function bukaModal(modal) {
    tutupSemua();
    if (!modal) return;
    modal.classList.add('aktif');
  }

  function tutupSemua() {
    modalMasuk?.classList.remove('aktif');
    modalDaftar?.classList.remove('aktif');
    modalVerifikasi?.classList.remove('aktif');
    if (timerInterval) clearInterval(timerInterval);
  }

  function bukaMasuk() {
    bukaModal(modalMasuk);
    document.getElementById('masuk-identitas')?.focus();
  }

  function bukaDaftar(restorasi = false) {
    bukaModal(modalDaftar);

    if (restorasi) {
      // Pulihkan old_values
      const elNama = document.getElementById('daftar-nama');
      const elEmail = document.getElementById('daftar-email');
      const elSandi = document.getElementById('daftar-sandi');
      const elHari = document.getElementById('daftar-hari');
      const elBulan = document.getElementById('daftar-bulan');
      const elTahun = document.getElementById('daftar-tahun');

      if (elNama) elNama.value = oldValues.nama;
      if (elEmail) elEmail.value = oldValues.email;
      if (elSandi) elSandi.value = oldValues.sandi;
      if (elHari) elHari.value = oldValues.hari;
      if (elBulan) elBulan.value = oldValues.bulan;
      if (elTahun) elTahun.value = oldValues.tahun;
    }

    document.getElementById('daftar-nama')?.focus();
  }

  function bukaVerifikasi(email) {
    bukaModal(modalVerifikasi);

    const emailEl = document.getElementById('verifikasi-target-email');
    if (emailEl) emailEl.textContent = email || oldValues.email || 'your email';

    const kodeInput = document.getElementById('verifikasi-kode');
    const tombolSubmit = document.getElementById('tombol-submit-verifikasi');
    const errorEl = document.getElementById('error-verifikasi-kode');

    if (kodeInput) {
      kodeInput.value = '';
      kodeInput.classList.remove('error');
      kodeInput.focus();
    }
    if (errorEl) {
      errorEl.classList.remove('aktif');
      errorEl.textContent = '';
    }
    if (tombolSubmit) {
      tombolSubmit.disabled = true;
    }

    // Mulai countdown timer 60 detik
    mulaiTimerResend();
  }

  function mulaiTimerResend() {
    if (timerInterval) clearInterval(timerInterval);
    sisaWaktu = 59;

    const timerEl = document.getElementById('teks-timer-resend');
    const tombolResend = document.getElementById('tombol-resend-kode');

    if (timerEl) {
      timerEl.style.display = 'inline';
      timerEl.textContent = `Resend code in (00:${sisaWaktu < 10 ? '0' : ''}${sisaWaktu})`;
    }
    if (tombolResend) tombolResend.style.display = 'none';

    timerInterval = setInterval(() => {
      sisaWaktu--;
      if (sisaWaktu > 0) {
        if (timerEl) timerEl.textContent = `Resend code in (00:${sisaWaktu < 10 ? '0' : ''}${sisaWaktu})`;
      } else {
        clearInterval(timerInterval);
        if (timerEl) timerEl.style.display = 'none';
        if (tombolResend) tombolResend.style.display = 'inline';
      }
    }, 1000);
  }

  function setInlineError(inputId, errorId, pesan) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (!input || !error) return;

    if (pesan) {
      input.classList.add('error');
      error.textContent = pesan;
      error.classList.add('aktif');
    } else {
      input.classList.remove('error');
      error.textContent = '';
      error.classList.remove('aktif');
    }
  }

  function validasiFormLogin(e) {
    e.preventDefault();
    const identitas = document.getElementById('masuk-identitas')?.value.trim();

    if (!identitas) {
      setInlineError('masuk-identitas', 'error-masuk-identitas', 'Silakan masukkan email atau nomor telepon Anda.');
      return;
    }

    setInlineError('masuk-identitas', 'error-masuk-identitas', '');
    alert('Selamat datang kembali di CRSL Merchandise Store!');
    tutupSemua();
  }

  function validasiFormRegister(e) {
    e.preventDefault();

    const elNama = document.getElementById('daftar-nama');
    const elEmail = document.getElementById('daftar-email');
    const elSandi = document.getElementById('daftar-sandi');
    const elHari = document.getElementById('daftar-hari');
    const elBulan = document.getElementById('daftar-bulan');
    const elTahun = document.getElementById('daftar-tahun');

    const nama = elNama?.value.trim();
    const email = elEmail?.value.trim();
    const sandi = elSandi?.value;
    const hari = elHari?.value;
    const bulan = elBulan?.value;
    const tahun = elTahun?.value;

    // Simpan old_values
    oldValues = { nama, email, sandi, hari, bulan, tahun };

    let valid = true;

    if (!nama) {
      setInlineError('daftar-nama', 'error-daftar-nama', 'Nama lengkap wajib diisi.');
      valid = false;
    } else {
      setInlineError('daftar-nama', 'error-daftar-nama', '');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setInlineError('daftar-email', 'error-daftar-email', 'Format email tidak valid.');
      valid = false;
    } else {
      setInlineError('daftar-email', 'error-daftar-email', '');
    }

    if (!sandi || sandi.length < 6) {
      setInlineError('daftar-sandi', 'error-daftar-sandi', 'Kata sandi minimal 6 karakter.');
      valid = false;
    } else {
      setInlineError('daftar-sandi', 'error-daftar-sandi', '');
    }

    if (!hari || !bulan || !tahun) {
      const errUltah = document.getElementById('error-daftar-ultah');
      if (errUltah) {
        errUltah.textContent = 'Silakan pilih tanggal, bulan, dan tahun lahir.';
        errUltah.classList.add('aktif');
      }
      valid = false;
    } else {
      const errUltah = document.getElementById('error-daftar-ultah');
      if (errUltah) {
        errUltah.textContent = '';
        errUltah.classList.remove('aktif');
      }
    }

    if (!valid) return;

    // Lulus validasi -> Buka modal "Verify accounts"
    bukaVerifikasi(email);
  }

  function init() {
    modalMasuk = document.getElementById('modal-masuk');
    modalDaftar = document.getElementById('modal-daftar');
    modalVerifikasi = document.getElementById('modal-verifikasi');

    // Tombol buka dari halaman
    document.querySelectorAll('[data-buka="modal-masuk"]').forEach(btn => {
      btn.addEventListener('click', bukaMasuk);
    });
    document.querySelectorAll('[data-buka="modal-daftar"]').forEach(btn => {
      btn.addEventListener('click', () => bukaDaftar(false));
    });

    // Tombol tutup
    document.querySelectorAll('.modal__tutup').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tutup');
        if (targetId) {
          document.getElementById(targetId)?.classList.remove('aktif');
        } else {
          tutupSemua();
        }
      });
    });

    // Khusus tombol X verifikasi: kembali ke modal register dengan old_values
    document.getElementById('tombol-tutup-verifikasi')?.addEventListener('click', () => {
      bukaDaftar(true);
    });

    // Switch antara login & daftar
    document.getElementById('switch-ke-daftar')?.addEventListener('click', (e) => {
      e.preventDefault();
      bukaDaftar(false);
    });
    document.getElementById('switch-ke-masuk')?.addEventListener('click', (e) => {
      e.preventDefault();
      bukaMasuk();
    });

    // Klik overlay luar untuk tutup
    [modalMasuk, modalDaftar, modalVerifikasi].forEach(modal => {
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) tutupSemua();
      });
    });

    // Form submits
    document.getElementById('form-login')?.addEventListener('submit', validasiFormLogin);
    document.getElementById('form-register')?.addEventListener('submit', validasiFormRegister);

    // Input kode verifikasi dinamis (aktifkan tombol saat 6 digit terisi)
    const kodeInput = document.getElementById('verifikasi-kode');
    const tombolVerify = document.getElementById('tombol-submit-verifikasi');
    const errorVerify = document.getElementById('error-verifikasi-kode');

    kodeInput?.addEventListener('input', () => {
      const val = kodeInput.value.replace(/\D/g, '');
      kodeInput.value = val;

      if (val.length === 6) {
        tombolVerify.disabled = false;
        errorVerify.classList.remove('aktif');
        kodeInput.classList.remove('error');
      } else {
        tombolVerify.disabled = true;
      }
    });

    // Submit verifikasi
    document.getElementById('form-verifikasi')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = kodeInput?.value.trim();

      // Kode demo valid: 123456
      if (val === '123456') {
        alert('Akun CRSL Anda berhasil diverifikasi dan aktif! Selamat berbelanja.');
        tutupSemua();
      } else {
        // Edge case: salah ketik kode 6 digit
        kodeInput?.classList.add('error');
        if (errorVerify) {
          errorVerify.textContent = 'Kode verifikasi salah atau tidak sesuai. Silakan gunakan kode 123456 untuk pengujian.';
          errorVerify.classList.add('aktif');
        }
      }
    });

    // Tombol resend kode
    document.getElementById('tombol-resend-kode')?.addEventListener('click', () => {
      alert(`Kode verifikasi 6 digit baru telah dikirim ke ${oldValues.email || 'email Anda'}.`);
      mulaiTimerResend();
    });

    // Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        tutupSemua();
      }
    });
  }

  return {
    init,
    bukaMasuk,
    bukaDaftar,
    bukaVerifikasi,
    tutupSemua,
  };
})();
