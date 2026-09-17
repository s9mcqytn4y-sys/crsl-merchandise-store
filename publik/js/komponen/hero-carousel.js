/**
 * Hero Banner Carousel - Vanilla JS
 * - 5 detik rotasi otomatis
 * - Progress bar kapsul animasi
 * - Auto-pause saat hover / sentuh
 * - Dukungan touch swipe di mobile
 */

const HeroCarousel = {
  container: null,
  track: null,
  slides: [],
  dots: [],
  currentIndex: 0,
  durasi: 5000,
  timer: null,
  isPaused: false,
  touchStartX: 0,
  touchEndX: 0,

  init() {
    this.container = document.querySelector('.hero');
    if (!this.container) return;

    this.track = this.container.querySelector('.hero__track');
    this.slides = Array.from(this.container.querySelectorAll('.hero__slide'));
    this.dots = Array.from(this.container.querySelectorAll('.hero__dot'));

    if (this.slides.length === 0) return;

    // Pasang event listener untuk tombol panah
    const btnKiri = this.container.querySelector('.hero__panah--kiri');
    const btnKanan = this.container.querySelector('.hero__panah--kanan');

    btnKiri?.addEventListener('click', () => {
      this.prev();
      this.resetTimer();
    });

    btnKanan?.addEventListener('click', () => {
      this.next();
      this.resetTimer();
    });

    // Pasang event listener untuk dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goTo(index);
        this.resetTimer();
      });
    });

    // Pause on hover
    this.container.addEventListener('mouseenter', () => {
      this.pause();
    });

    this.container.addEventListener('mouseleave', () => {
      this.resume();
    });

    // Touch swipe di mobile
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.pause();
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
      this.resume();
    }, { passive: true });

    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prev();
        this.resetTimer();
      } else if (e.key === 'ArrowRight') {
        this.next();
        this.resetTimer();
      }
    });

    // Aktifkan slide pertama dan mulai timer
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

    // Geser track horizontal
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    // Perbarui status dots
    this.dots.forEach((dot, i) => {
      if (i === this.currentIndex) {
        dot.classList.add('aktif');
        dot.setAttribute('aria-current', 'true');

        // Restart animasi progress bar kapsul
        const progress = dot.querySelector('.hero__dot-progress');
        if (progress) {
          progress.style.animation = 'none';
          // Force reflow
          void progress.offsetWidth;
          progress.style.animation = `hero-progress ${this.durasi / 1000}s linear forwards`;
        }
      } else {
        dot.classList.remove('aktif');
        dot.removeAttribute('aria-current');
      }
    });
  },

  startTimer() {
    this.clearTimer();
    this.timer = setInterval(() => {
      if (!this.isPaused) {
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

  resetTimer() {
    this.clearTimer();
    this.startTimer();
  },

  pause() {
    this.isPaused = true;
    this.container?.classList.add('berhenti');
  },

  resume() {
    this.isPaused = false;
    this.container?.classList.remove('berhenti');
  },

  handleSwipe() {
    const threshold = 40; // minimum jarak geser
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe ke kiri -> next slide
        this.next();
      } else {
        // Swipe ke kanan -> prev slide
        this.prev();
      }
      this.resetTimer();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  HeroCarousel.init();
});
