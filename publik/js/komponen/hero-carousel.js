/**
 * Hero Banner Carousel - Vanilla JS
 * Kepatuhan /web-design-guidelines:
 * - Rotasi otomatis 5 detik per slide
 * - Animasi progress bar kapsul indikator
 * - Interaksi non-blocking: auto-resume setelah interaksi manual
 * - Dukungan touch swipe & keyboard accessibility
 */

const HeroCarousel = {
  container: null,
  track: null,
  slides: [],
  dots: [],
  currentIndex: 0,
  durasi: 5000,
  timer: null,
  resumeTimeout: null,
  isInteracting: false,
  touchStartX: 0,
  touchEndX: 0,

  init() {
    this.container = document.querySelector('.hero');
    if (!this.container) return;

    this.track = this.container.querySelector('.hero__track');
    this.slides = Array.from(this.container.querySelectorAll('.hero__slide'));
    this.dots = Array.from(this.container.querySelectorAll('.hero__dot'));

    if (this.slides.length === 0) return;

    // Pasang event listener tombol navigasi panah
    const btnKiri = this.container.querySelector('.hero__panah--kiri');
    const btnKanan = this.container.querySelector('.hero__panah--kanan');

    btnKiri?.addEventListener('click', () => {
      this.prev();
      this.handleUserInteraction();
    });

    btnKanan?.addEventListener('click', () => {
      this.next();
      this.handleUserInteraction();
    });

    // Pasang event listener untuk dots indikator
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goTo(index);
        this.handleUserInteraction();
      });
    });

    // Pause hanya saat hover di kontrol interaktif (CTA, tombol panah, atau dots)
    const kontrolList = this.container.querySelectorAll('.hero__cta, .hero__panah, .hero__dots');
    kontrolList.forEach((el) => {
      el.addEventListener('mouseenter', () => this.pause());
      el.addEventListener('mouseleave', () => this.resume());
    });

    // Touch swipe gesture di perangkat seluler
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.pause();
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
      this.handleUserInteraction();
    }, { passive: true });

    // Navigasi Keyboard (Panah Kiri / Kanan)
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prev();
        this.handleUserInteraction();
      } else if (e.key === 'ArrowRight') {
        this.next();
        this.handleUserInteraction();
      }
    });

    // Inisialisasi tampilan awal & mulai rotasi otomatis
    this.updateUI();
    this.startTimer();
  },

  goTo(index) {
    if (index < 0) {
      this.currentIndex = this.slides.length - 1;
    } else if (index >= this.slides.length) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = index;
    }
    this.updateUI();
  },

  next() {
    this.goTo(this.currentIndex + 1);
  },

  prev() {
    this.goTo(this.currentIndex - 1);
  },

  updateUI() {
    if (!this.track) return;

    // Pergeseran horizontal 100% per slide
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    // Perbarui status dots kapsul
    this.dots.forEach((dot, i) => {
      const progress = dot.querySelector('.hero__dot-progress');

      if (i === this.currentIndex) {
        dot.classList.add('aktif');
        dot.setAttribute('aria-selected', 'true');

        if (progress) {
          progress.style.animation = 'none';
          void progress.offsetWidth; // trigger reflow
          progress.style.animation = `hero-progress ${this.durasi / 1000}s linear forwards`;
        }
      } else {
        dot.classList.remove('aktif');
        dot.setAttribute('aria-selected', 'false');
        if (progress) {
          progress.style.animation = 'none';
        }
      }
    });
  },

  startTimer() {
    this.clearTimer();
    this.timer = setInterval(() => {
      if (!this.isInteracting) {
        this.next();
      }
    }, this.durasi);
  },

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  pause() {
    this.isInteracting = true;
    this.container?.classList.add('berhenti');
  },

  resume() {
    this.isInteracting = false;
    this.container?.classList.remove('berhenti');
  },

  handleUserInteraction() {
    this.pause();
    if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
    // Lanjutkan kembali otomatis setelah 4 detik tidak ada interaksi
    this.resumeTimeout = setTimeout(() => {
      this.resume();
      this.startTimer();
    }, 4000);
  },

  handleSwipe() {
    const threshold = 40;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  HeroCarousel.init();
});
