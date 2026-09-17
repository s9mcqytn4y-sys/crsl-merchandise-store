<?php
/**
 * Komponen Pencarian (Search Overlay)
 * Sesuai Anatomi Gambar 1
 */
?>
<!-- ========== PENCARIAN (Search Overlay) ========== -->
<div id="pencarian-overlay" class="pencarian__overlay" aria-hidden="true"></div>
<div
  id="pencarian"
  class="pencarian"
  role="dialog"
  aria-modal="true"
  aria-label="Pencarian produk"
>
  <!-- Bar Input di Tengah -->
  <div class="pencarian__bar-wadah">
    <div class="pencarian__input-wadah">
      <input
        type="search"
        id="pencarian-input"
        class="pencarian__input"
        placeholder="Search our products"
        autocomplete="off"
        aria-label="Search our products"
      >
      <button type="button" id="pencarian-kirim" class="pencarian__tombol-kirim" aria-label="Cari">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>
    </div>
    <button
      type="button"
      id="tombol-tutup-pencarian"
      class="pencarian__tombol-tutup"
      aria-label="Tutup pencarian"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>

  <!-- Kontainer Konten Pencarian -->
  <div class="pencarian__kontainer">
    <!-- 1. Recent Search -->
    <div id="pencarian-riwayat" class="pencarian__riwayat tersembunyi">
      <div class="pencarian__riwayat-header">
        <p class="pencarian__subjudul">Recent Search</p>
        <button type="button" id="tombol-hapus-semua-riwayat" class="pencarian__hapus-semua">Delete all</button>
      </div>
      <div id="pencarian-riwayat-list" class="pencarian__kapsul-list">
        <!-- Diisi oleh JS: [kata-kunci X] -->
      </div>
    </div>

    <!-- 2. Popular Search Terms -->
    <div class="pencarian__populer">
      <p class="pencarian__subjudul">Popular Search Terms</p>
      <div id="pencarian-populer-list" class="pencarian__kapsul-list">
        <!-- Diisi oleh JS: slingbag, helm, monie, mosko, topi, yori, ruby, wallet -->
      </div>
    </div>

    <!-- 3. Recent Viewed -->
    <div class="pencarian__dilihat">
      <p class="pencarian__subjudul">Recent Viewed</p>
      <div class="pencarian__kartu-produk">
        <div class="pencarian__gambar-wadah">
          <img
            src="/aset/gambar/cassie-wallet.webp"
            alt="CRSL Cassie Wallet"
            class="pencarian__gambar"
            loading="lazy"
          >
          <button
            type="button"
            id="tombol-keranjang-cassie"
            class="pencarian__tombol-keranjang-cepat"
            aria-label="Tambah Cassie Wallet ke keranjang"
            title="Add to Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </button>
        </div>
        <p class="pencarian__nama-produk">CRSL Cassie Wallet | Domp...</p>
        <p class="pencarian__harga-coret">Rp 199,000</p>
        <p class="pencarian__harga-aktif">Rp 179,100</p>
      </div>
    </div>

    <!-- 4. Live Search Results -->
    <div id="pencarian-hasil" class="pencarian__hasil tersembunyi" aria-live="polite">
      <div class="pencarian__riwayat-header">
        <p class="pencarian__subjudul" id="pencarian-hasil-judul">Search Results</p>
        <span id="pencarian-hasil-jumlah" class="pencarian__hasil-jumlah"></span>
      </div>
      <div id="pencarian-hasil-grid" class="pencarian__hasil-grid"></div>
    </div>
  </div>
</div>
