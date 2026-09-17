<?php
/**
 * CRSL Merchandise Store - Seksi 2-Kolom BTS Must-Have Bundle
 * Dilengkapi transisi otomatis gambar cover ke freebies,
 * lokalisasi i18n, & tautan ke halaman detail bundle.
 */
?>
<section class="seksi-bundle seksi-dinamis muncul-saat-scroll" id="bundles" aria-labelledby="judul-bundle">
  <header class="seksi-bundle__header">
    <span class="seksi-bundle__tag" data-i18n="bundle.badge_hemat">HEMAT HINGGA 15%</span>
    <h2 class="seksi-bundle__judul" id="judul-bundle" data-i18n="bundle.judul_seksi">BTS Must-Have Bundle</h2>
    <p class="seksi-bundle__subjudul" data-i18n="bundle.subjudul_seksi" style="color: var(--warna-teks-redup); margin-top: 0.5rem; font-size: 0.95rem;">
      Paket hemat Back to School terlengkap untuk menemanimu!
    </p>
  </header>

  <div class="seksi-bundle__grid">
    <!-- Kartu Bundle 1: BACK TO SCHOOL with Miflo -->
    <article class="bundle-kartu" data-bundle-id="3516" data-bundle-slug="back-to-school-with-miflo">
      <div class="bundle-kartu__slider-box" id="bundle-slider-3516">
        <span class="bundle-kartu__badge">BUNDLE SPECIAL</span>
        <div class="bundle-kartu__track" id="bundle-track-3516">
          <div class="bundle-kartu__slide">
            <img 
              src="/aset/gambar/bundle-miflo-cover.webp" 
              alt="BACK TO SCHOOL with Miflo - Lifestyle Model" 
              class="bundle-kartu__gambar"
              loading="lazy"
              width="600"
              height="600"
            >
          </div>
          <div class="bundle-kartu__slide">
            <img 
              src="/aset/gambar/bundle-miflo-freebies.webp" 
              alt="BACK TO SCHOOL with Miflo - Freebies Pack" 
              class="bundle-kartu__gambar"
              loading="lazy"
              width="600"
              height="600"
            >
          </div>
        </div>
        <div class="bundle-kartu__dots">
          <span class="bundle-kartu__dot bundle-kartu__dot--aktif" data-idx="0"></span>
          <span class="bundle-kartu__dot" data-idx="1"></span>
        </div>
      </div>
      <div class="bundle-kartu__info">
        <a href="/bundle/back-to-school-with-miflo" class="bundle-kartu__judul-link">
          <h3 class="bundle-kartu__judul">BACK TO SCHOOL with Miflo</h3>
        </a>
        <p style="font-size: 0.85rem; color: var(--warna-teks-redup);">1 Miflo Mini Backpack + 1 Ropy Keychain + Bonus Spesial</p>
        <div class="bundle-kartu__harga-box">
          <div>
            <span class="bundle-kartu__harga">Rp 289,000</span>
            <span class="bundle-kartu__harga-coret">Rp 343,100</span>
          </div>
          <a href="/bundle/back-to-school-with-miflo" class="bundle-kartu__cta-btn">
            <span data-i18n="bundle.lihat_detail">Lihat Paket</span> →
          </a>
        </div>
      </div>
    </article>

    <!-- Kartu Bundle 2: BACK TO SCHOOL WITH HARU! -->
    <article class="bundle-kartu" data-bundle-id="2188" data-bundle-slug="back-to-school-with-haru">
      <div class="bundle-kartu__slider-box" id="bundle-slider-2188">
        <span class="bundle-kartu__badge">BUNDLE SPECIAL</span>
        <div class="bundle-kartu__track" id="bundle-track-2188">
          <div class="bundle-kartu__slide">
            <img 
              src="/aset/gambar/bundle-haru-cover.webp" 
              alt="BACK TO SCHOOL WITH HARU! - Lifestyle Model" 
              class="bundle-kartu__gambar"
              loading="lazy"
              width="600"
              height="600"
            >
          </div>
          <div class="bundle-kartu__slide">
            <img 
              src="/aset/gambar/bundle-haru-freebies.webp" 
              alt="BACK TO SCHOOL WITH HARU! - Freebies Pack" 
              class="bundle-kartu__gambar"
              loading="lazy"
              width="600"
              height="600"
            >
          </div>
        </div>
        <div class="bundle-kartu__dots">
          <span class="bundle-kartu__dot bundle-kartu__dot--aktif" data-idx="0"></span>
          <span class="bundle-kartu__dot" data-idx="1"></span>
        </div>
      </div>
      <div class="bundle-kartu__info">
        <a href="/bundle/back-to-school-with-haru" class="bundle-kartu__judul-link">
          <h3 class="bundle-kartu__judul">BACK TO SCHOOL WITH HARU!</h3>
        </a>
        <p style="font-size: 0.85rem; color: var(--warna-teks-redup);">1 Haru Tartan Backpack + 1 Character Pin Pack + Bonus Spesial</p>
        <div class="bundle-kartu__harga-box">
          <div>
            <span class="bundle-kartu__harga">Rp 329,000</span>
            <span class="bundle-kartu__harga-coret">Rp 395,000</span>
          </div>
          <a href="/bundle/back-to-school-with-haru" class="bundle-kartu__cta-btn">
            <span data-i18n="bundle.lihat_detail">Lihat Paket</span> →
          </a>
        </div>
      </div>
    </article>
  </div>
</section>

<script>
// Script interaktif transisi gambar otomatis dari kanan ke kiri untuk kartu bundle
(function() {
  function inisialisasiSliderBundle(idTrack, idBox) {
    const track = document.getElementById(idTrack);
    const box = document.getElementById(idBox);
    if (!track || !box) return;

    const dots = box.querySelectorAll('.bundle-kartu__dot');
    let aktif = 0;
    let timer = null;

    function gantiSlide(ke) {
      aktif = ke % 2;
      track.style.transform = `translateX(-${aktif * 50}%)`;
      dots.forEach((d, i) => {
        d.classList.toggle('bundle-kartu__dot--aktif', i === aktif);
      });
    }

    function mulaiOtomatis() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        gantiSlide(aktif + 1);
      }, 4000);
    }

    box.addEventListener('mouseenter', () => clearInterval(timer));
    box.addEventListener('mouseleave', () => mulaiOtomatis());

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        gantiSlide(idx);
        mulaiOtomatis();
      });
    });

    mulaiOtomatis();
  }

  document.addEventListener('DOMContentLoaded', () => {
    inisialisasiSliderBundle('bundle-track-3516', 'bundle-slider-3516');
    inisialisasiSliderBundle('bundle-track-2188', 'bundle-slider-2188');
  });
})();
</script>
