/**
 * CTA Mengambang - Floating Sticky CTAs Controller
 * - WhatsApp Support pop-up toggle
 * - Claim Voucher pop-up modal & application state
 */

const CtaMengambang = (() => {
  let waWadah = null;
  let waTombol = null;
  let voucherTombol = null;
  let voucherOverlay = null;
  let voucherTutup = null;
  let voucherAksi = null;

  function initWhatsApp() {
    waWadah = document.getElementById('cta-wa-wadah');
    waTombol = document.getElementById('cta-wa-tombol');

    if (!waWadah || !waTombol) return;

    waTombol.addEventListener('click', (e) => {
      e.stopPropagation();
      waWadah.classList.toggle('terbuka');
    });

    // Klik di luar menutup pop-up
    document.addEventListener('click', (e) => {
      if (waWadah.classList.contains('terbuka') && !waWadah.contains(e.target)) {
        waWadah.classList.remove('terbuka');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && waWadah.classList.contains('terbuka')) {
        waWadah.classList.remove('terbuka');
      }
    });
  }

  function initVoucher() {
    voucherTombol = document.getElementById('cta-voucher-tombol');
    voucherOverlay = document.getElementById('modal-voucher-overlay');
    voucherTutup = document.getElementById('modal-voucher-tutup');
    voucherAksi = document.getElementById('modal-voucher-aksi');

    if (!voucherTombol || !voucherOverlay) return;

    const bukaModal = () => {
      voucherOverlay.classList.add('aktif');
      document.getElementById('modal-voucher-aksi')?.focus();
    };

    const tutupModal = () => {
      voucherOverlay.classList.remove('aktif');
    };

    voucherTombol.addEventListener('click', bukaModal);
    voucherTutup?.addEventListener('click', tutupModal);
    voucherOverlay.addEventListener('click', (e) => {
      if (e.target === voucherOverlay) tutupModal();
    });

    // Klaim / Continue Shopping aksi
    voucherAksi?.addEventListener('click', () => {
      const feedback = document.getElementById('modal-voucher-feedback');
      if (feedback) {
        feedback.classList.add('aktif');
        feedback.textContent = 'Kupon Diskon 10% & Gratis Ongkir berhasil diterapkan!';
      }
      setTimeout(() => {
        tutupModal();
      }, 1200);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && voucherOverlay.classList.contains('aktif')) {
        tutupModal();
      }
    });
  }

  function init() {
    initWhatsApp();
    initVoucher();
  }

  return { init };
})();
