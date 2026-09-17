/**
 * Aplikasi - Main Entry Point
 * Inisialisasi semua komponen setelah DOM ready
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load translations first
  if (typeof I18n !== 'undefined') {
    await I18n.init();
  }

  // 2. Initialize components that depend on i18n
  if (typeof BilahAtas !== 'undefined') BilahAtas.init();

  // 3. Initialize interactive components
  if (typeof Navigasi !== 'undefined') Navigasi.init();
  if (typeof MenuSamping !== 'undefined') MenuSamping.init();
  if (typeof Pencarian !== 'undefined') Pencarian.init();
  if (typeof Preferensi !== 'undefined') Preferensi.init();
  if (typeof Keranjang !== 'undefined') Keranjang.init();
  if (typeof CtaMengambang !== 'undefined') CtaMengambang.init();
  if (typeof Otentikasi !== 'undefined') Otentikasi.init();
  if (typeof HeroCarousel !== 'undefined') HeroCarousel.init();
  if (typeof KarakterShowcase !== 'undefined') KarakterShowcase.init();

  // 4. Global delegation for quick-cart buttons on product cards
  document.addEventListener('click', (e) => {
    const btnQuick = e.target.closest('[data-aksi="quick-cart"]');
    if (btnQuick && typeof Keranjang !== 'undefined') {
      e.preventDefault();
      const produk = {
        id: btnQuick.dataset.id || 'crsl-product',
        nama: btnQuick.dataset.nama || 'CRSL Merchandise',
        harga: parseInt(btnQuick.dataset.harga, 10) || 179100,
        hargaCoret: parseInt(btnQuick.dataset.hargaCoret, 10) || 199000,
        gambar: btnQuick.dataset.gambar || '/aset/gambar/cassie-wallet.webp',
        varianPilihan: ['CHILO PINK', 'CHOCO BROWN']
      };
      Keranjang.bukaAddCart(produk);
    }
  });

  // 5. Scroll reveal animation for sections
  const revealElements = document.querySelectorAll('.muncul-saat-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('terlihat');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('terlihat'));
  }
});

