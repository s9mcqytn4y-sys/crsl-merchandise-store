<?php
/**
 * Komponen Section Pre-Order Now!
 * Overhaul 2 Kolom: Kolom Kiri Informasi & Judul, Kolom Kanan Kartu Produk
 * Kepatuhan /antislop-layoutmobile & /i18n-localization
 */
?>
<section class="pre-order seksi-dinamis muncul-saat-scroll" id="pre-order-section" aria-label="Pre-Order CRSL">
  <div class="pre-order__kontainer">
    <!-- Kolom Kiri: Judul & Informasi Copywriting Eksklusif -->
    <div class="pre-order__kolom-kiri">
      <span class="pre-order__tag-edisi" data-i18n="beranda.preorder_tag">EDISI SPESIAL PRE-ORDER</span>
      
      <h2 class="pre-order__judul" data-i18n="beranda.preorder_judul">
        PRE-ORDER NOW!
      </h2>

      <p class="pre-order__deskripsi" data-i18n="beranda.preorder_deskripsi">
        Miliki koleksi Drinke Tumblr Series 900ml eksklusif dengan 5 karakter sahabat CRSL. Menjaga suhu minuman tetap dingin hingga 12 jam, dirancang tahan bocor dan siap menemani petualangan harianmu.
      </p>

      <ul class="pre-order__keunggulan-list">
        <li class="pre-order__keunggulan-item">
          <svg class="pre-order__keunggulan-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span data-i18n="beranda.preorder_fitur1">Estimasi pengiriman 30 hari kerja</span>
        </li>
        <li class="pre-order__keunggulan-item">
          <svg class="pre-order__keunggulan-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span data-i18n="beranda.preorder_fitur2">Material food-grade stainless steel 304</span>
        </li>
        <li class="pre-order__keunggulan-item">
          <svg class="pre-order__keunggulan-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span data-i18n="beranda.preorder_fitur3">Termasuk bonus stiker pack karakter eksklusif</span>
        </li>
      </ul>

      <div class="pre-order__aksi-kiri">
        <a href="/products" class="pre-order__tautan-koleksi" data-i18n="beranda.preorder_tautan">
          Eksplor Koleksi Lainnya &rarr;
        </a>
      </div>
    </div>

    <!-- Kolom Kanan: Kartu Produk Pre-Order (Tuning Card Layout & Tanpa Outline Hitam) -->
    <div class="pre-order__kolom-kanan">
      <article class="pre-order__kartu">
        <div class="pre-order__gambar-wadah">
          <span class="pre-order__badge" data-i18n="beranda.preorder_badge">PRE ORDER</span>
          <a href="/produk/crsl-drinke-tumblr-series" aria-label="Lihat detail CRSL Drinke Tumblr Series">
            <img
              src="/aset/gambar/drinke-tumblr.webp"
              alt="CRSL Drinke Tumblr Series"
              class="pre-order__gambar"
              loading="lazy"
              width="360"
              height="360"
            >
          </a>
        </div>

        <div class="pre-order__konten">
          <span class="pre-order__kategori">Tumbler Collection</span>
          <h3 class="pre-order__nama" title="CRSL Drinke Tumblr Series | Botol Tempat minum | Tumbler | Tumbler travel bottle stainless 900ml 32oz (po 30 hari)">
            <a href="/produk/crsl-drinke-tumblr-series" style="color: inherit; text-decoration: none;">
              CRSL Drinke Tumblr Series | Botol Tempat Minum Stainless 900ml
            </a>
          </h3>

          <div class="pre-order__harga-baris">
            <span class="pre-order__harga">Rp 289.000</span>
          </div>

          <button
            type="button"
            class="pre-order__tombol-buy"
            data-aksi="quick-cart"
            data-id="crsl-drinke-tumblr"
            data-nama="CRSL Drinke Tumblr Series | Botol Tempat minum | Tumbler 900ml"
            data-harga="289000"
            data-harga-coret="289000"
            data-gambar="/aset/gambar/drinke-tumblr.webp"
            data-varian='["CHILO PINK", "POPO BLUE", "ODIN YELLOW", "CHOCO GREY", "PIGKO PEACH"]'
            aria-label="Pesan Pre-Order CRSL Drinke Tumblr Series"
          >
            <span data-i18n="beranda.preorder_tombol_beli">Pre Order now</span>
          </button>
        </div>
      </article>
    </div>
  </div>
</section>
