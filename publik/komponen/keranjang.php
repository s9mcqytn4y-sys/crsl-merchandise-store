<?php
/**
 * Komponen Keranjang Belanja (Cart)
 * - Modal Pop-up "Add to Cart" (Gambar 2)
 * - Drawer Samping "Cart" (Gambar 3)
 * - Bar Melayang Bawah Layar (Gambar 1)
 */
?>
<!-- ========== MODAL ADD TO CART (Gambar 2) ========== -->
<div id="modal-add-cart-overlay" class="modal-add-cart-overlay" aria-hidden="true">
  <div id="modal-add-cart" class="modal-add-cart" role="dialog" aria-modal="true" aria-labelledby="add-cart-judul">
    <div class="modal-add-cart__header">
      <h3 id="add-cart-judul" class="modal-add-cart__judul">Add to Cart</h3>
      <button type="button" id="tombol-tutup-add-cart" class="modal-add-cart__tutup" aria-label="Tutup modal tambah keranjang">
        ✕
      </button>
    </div>

    <!-- Info Produk Ringkas -->
    <div class="modal-add-cart__produk-box">
      <img
        id="add-cart-thumb"
        src="/aset/gambar/cassie-wallet.webp"
        alt="Thumbnail produk"
        class="modal-add-cart__thumb"
      >
      <div class="modal-add-cart__produk-info">
        <h4 id="add-cart-nama" class="modal-add-cart__nama-produk">
          CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid | Compact &amp; Stylish
        </h4>
      </div>
    </div>

    <!-- Pilihan Varian (Color) -->
    <div class="modal-add-cart__varian-bagian">
      <p class="modal-add-cart__varian-label">Color</p>
      <div class="modal-add-cart__varian-list">
        <!-- Varian 1: CHILO PINK -->
        <button
          type="button"
          class="modal-add-cart__varian-item terpilih"
          data-varian="CHILO PINK"
          aria-label="Pilih varian Chilo Pink"
        >
          <div class="modal-add-cart__varian-thumb-wadah">
            <img
              src="/aset/gambar/cassie-wallet.webp"
              alt="Chilo Pink"
              class="modal-add-cart__varian-thumb"
            >
          </div>
          <span class="modal-add-cart__varian-nama">CHILO PINK</span>
        </button>

        <!-- Varian 2: CHOCO BROWN -->
        <button
          type="button"
          class="modal-add-cart__varian-item"
          data-varian="CHOCO BROWN"
          aria-label="Pilih varian Choco Brown"
        >
          <div class="modal-add-cart__varian-thumb-wadah">
            <img
              src="/aset/gambar/cassie-wallet.webp"
              alt="Choco Brown"
              class="modal-add-cart__varian-thumb"
            >
          </div>
          <span class="modal-add-cart__varian-nama">CHOCO BROWN</span>
        </button>
      </div>
    </div>

    <!-- Stepper Kuantitas Terpusat (Min 1, tidak boleh 0 atau minus) -->
    <div class="modal-add-cart__stepper">
      <button type="button" id="add-cart-kurang" class="modal-add-cart__stepper-tombol" aria-label="Kurangi jumlah">-</button>
      <span id="add-cart-qty" class="modal-add-cart__stepper-angka">1</span>
      <button type="button" id="add-cart-tambah" class="modal-add-cart__stepper-tombol" aria-label="Tambah jumlah">+</button>
    </div>

    <!-- Tombol Merah Add to Cart -->
    <button type="button" id="tombol-submit-add-cart" class="modal-add-cart__tombol-submit">
      Add to Cart
    </button>
  </div>
</div>

<!-- ========== DRAWER CART (Gambar 3) ========== -->
<div id="keranjang-drawer-overlay" class="keranjang-drawer-overlay" aria-hidden="true"></div>
<aside id="keranjang-drawer" class="keranjang-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-judul">
  <div class="keranjang-drawer__header">
    <h3 id="cart-drawer-judul" class="keranjang-drawer__judul">Cart</h3>
    <button type="button" id="tombol-tutup-cart-drawer" class="keranjang-drawer__tutup" aria-label="Tutup keranjang">
      ✕
    </button>
  </div>

  <!-- Daftar Item Keranjang -->
  <div id="keranjang-items-list" class="keranjang-drawer__isi">
    <!-- Diisi oleh JS -->
  </div>

  <!-- Footer Keranjang & Checkout -->
  <div id="keranjang-drawer-footer" class="keranjang-drawer__footer">
    <div class="keranjang-drawer__total-baris">
      <span id="keranjang-total-label" class="keranjang-drawer__total-label">Total Price (0)</span>
      <span id="keranjang-total-nilai" class="keranjang-drawer__total-nilai">Rp 0</span>
    </div>
    <div class="keranjang-drawer__hemat" style="display: none;">
      <span>🏷️</span>
      <span id="keranjang-hemat-nilai">Save Rp 0</span>
    </div>
    <a href="/checkout" class="keranjang-drawer__tombol-checkout">
      Checkout with Discount
    </a>
    <p class="keranjang-drawer__loyalty-note">
      Join now to earn points! <a href="/akun" class="keranjang-drawer__loyalty-link">Login</a>
    </p>
  </div>
</aside>

<!-- ========== BAR MELAYANG BAWAH LAYAR (Gambar 1) ========== -->
<div id="keranjang-bar-bawah" class="keranjang-bar-bawah" role="button" aria-label="Buka keranjang belanja">
  <div class="keranjang-bar-bawah__info">
    <span id="bar-bawah-label" class="keranjang-bar-bawah__label">1 Items in My Cart</span>
    <span id="bar-bawah-harga" class="keranjang-bar-bawah__harga">Rp 179,100</span>
  </div>
  <div class="keranjang-bar-bawah__badge-ikon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    <span id="bar-bawah-badge" class="keranjang-bar-bawah__jumlah-badge">1</span>
  </div>
</div>
