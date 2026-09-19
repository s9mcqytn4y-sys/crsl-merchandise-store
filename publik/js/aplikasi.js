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

  // 6. Advanced subtle Parallax effect (GPU accelerated translate3d with bounds clamping)
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winHeight = window.innerHeight;
          parallaxElements.forEach((el) => {
            const speed = parseFloat(el.dataset.parallax) || 0.08;
            const rect = el.getBoundingClientRect();
            if (rect.top < winHeight && rect.bottom > 0) {
              const rawOffset = (rect.top - winHeight / 2) * speed;
              const clampedOffset = Math.max(-28, Math.min(28, rawOffset));
              el.style.transform = `translate3d(0, ${clampedOffset.toFixed(1)}px, 0)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // 7. Optimasi Manajemen LocalStorage & User Activity Tracking
  try {
    const now = Date.now();
    localStorage.setItem('crsl_last_activity', now.toString());

    // Pembersihan berkala data usang (TTL 7 hari)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const lastCleanup = parseInt(localStorage.getItem('crsl_last_cleanup') || '0', 10);
    if (now - lastCleanup > 24 * 60 * 60 * 1000) {
      // Jalankan pembersihan sampah cache
      localStorage.setItem('crsl_last_cleanup', now.toString());
      // Batasi riwayat recent viewed maksimal 12 item
      const rawRecent = localStorage.getItem('crsl_recent_pdp_history');
      if (rawRecent) {
        const recent = JSON.parse(rawRecent);
        if (Array.isArray(recent) && recent.length > 12) {
          localStorage.setItem('crsl_recent_pdp_history', JSON.stringify(recent.slice(0, 12)));
        }
      }
    }
  } catch (err) {
    // Graceful handling jika storage quota exceeded atau private mode
  }

  // 8. Hover Intent Smart Prefetching untuk Navigasi Cepat
  const prefetchedUrls = new Set();
  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('a[href^="/"]');
    if (!link || link.target === '_blank') return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('/#') || href.startsWith('/api') || prefetchedUrls.has(href)) return;

    prefetchedUrls.add(href);
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = href;
    document.head.appendChild(prefetchLink);
  }, { passive: true });
});


