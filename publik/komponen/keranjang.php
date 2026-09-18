<?php
/**
 * Komponen Keranjang Belanja (Cart) - CRSL Merchandise Store
 * Kepatuhan /antislop-ui, /antislop-layoutmobile, & /baseline-ui
 * - Drawer Samping Cart (Sesuai Gambar 4)
 * - Warning Banner "Only 5 stocks left."
 * - Dukungan Tag PRE ORDER & BUNDLED PRODUCT dengan Sub-item List
 * - Trust Badges: Secure Payment & Privacy Protection
 * - Recently Ordered Carousel di dalam Drawer
 * - Progress Loyalitas: "Spend Rp 200,000 more to reach New Freen"
 * - Bar Melayang Bawah Layar: "X Items in My Cart Rp ... [Badge]"
 */
?>
<!-- ========== MODAL ADD TO CART RINGKAS ========== -->
<div id="modal-add-cart-overlay" class="modal-add-cart-overlay" aria-hidden="true">
  <div id="modal-add-cart" class="modal-add-cart" role="dialog" aria-modal="true" aria-labelledby="add-cart-judul">
    <div class="modal-add-cart__header">
      <h3 id="add-cart-judul" class="modal-add-cart__judul">Add to Cart</h3>
      <button type="button" id="tombol-tutup-add-cart" class="modal-add-cart__tutup" aria-label="Tutup modal tambah keranjang">
        &times;
      </button>
    </div>

    <!-- Info Produk Ringkas -->
    <div class="modal-add-cart__produk-box">
      <img
        id="add-cart-thumb"
        src="/aset/gambar/cassie-wallet.webp"
        alt="Thumbnail produk"
        class="modal-add-cart__thumb"
        width="60"
        height="60"
      >
      <div class="modal-add-cart__produk-info">
        <h4 id="add-cart-nama" class="modal-add-cart__nama-produk">
          CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid
        </h4>
      </div>
    </div>

    <!-- Pilihan Varian (Color) -->
    <div class="modal-add-cart__varian-bagian">
      <p class="modal-add-cart__varian-label">Color</p>
      <div class="modal-add-cart__varian-list" id="modal-add-cart-varian-list">
        <!-- Diisi secara dinamis -->
      </div>
    </div>

    <!-- Stepper Kuantitas -->
    <div class="modal-add-cart__stepper">
      <button type="button" id="add-cart-kurang" class="modal-add-cart__stepper-tombol" aria-label="Kurangi jumlah">&minus;</button>
      <span id="add-cart-qty" class="modal-add-cart__stepper-angka">1</span>
      <button type="button" id="add-cart-tambah" class="modal-add-cart__stepper-tombol" aria-label="Tambah jumlah">&plus;</button>
    </div>

    <!-- Tombol Merah Add to Cart -->
    <button type="button" id="tombol-submit-add-cart" class="modal-add-cart__tombol-submit">
      Add to Cart
    </button>
  </div>
</div>

<!-- ========== DRAWER CART LENGKAP (Gambar 4) ========== -->
<div id="keranjang-drawer-overlay" class="keranjang-drawer-overlay" aria-hidden="true"></div>
<aside id="keranjang-drawer" class="keranjang-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-judul">
  
  <!-- Header Drawer -->
  <div class="keranjang-drawer__header">
    <h3 id="cart-drawer-judul" class="keranjang-drawer__judul">Cart</h3>
    <button type="button" id="tombol-tutup-cart-drawer" class="keranjang-drawer__tutup" aria-label="Tutup keranjang">
      &times;
    </button>
  </div>

  <!-- Area Konten Scrollable Drawer -->
  <div class="keranjang-drawer__isi-scroll">
    
    <!-- Warning Stok Tipis (Gambar 4) -->
    <div class="keranjang-drawer__stok-warning-wrap">
      <div class="keranjang-drawer__stok-warning">
        Only 5 stocks left.
      </div>
    </div>

    <!-- Daftar Item Keranjang -->
    <div id="keranjang-items-list" class="keranjang-drawer__isi">
      <!-- Diisi secara dinamis oleh JS -->
    </div>

    <!-- Trust Badges (Gambar 4) -->
    <div class="keranjang-drawer__trust-badges">
      <div class="keranjang-drawer__trust-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <span>Secure payment</span>
      </div>
      <div class="keranjang-drawer__trust-divider" aria-hidden="true"></div>
      <div class="keranjang-drawer__trust-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
        <span>Privacy protection</span>
      </div>
    </div>

    <!-- Section Recently Ordered Carousel (Gambar 4) -->
    <div class="keranjang-drawer__recently-ordered">
      <h4 class="keranjang-drawer__recently-judul">Recently Ordered</h4>
      <div class="keranjang-drawer__recently-grid" id="keranjang-recently-grid">
        
        <!-- Card 1: Chubbi Tumbler -->
        <article class="keranjang-mini-card">
          <div class="keranjang-mini-card__media">
            <img src="/aset/gambar/drinke-tumblr.webp" alt="CRSL Chubbi Tumbler Series" loading="lazy" width="130" height="130">
            <button type="button" class="keranjang-mini-card__btn-add" data-id="743921" data-nama="CRSL Chubbi Tumbler Series | Botol minum" data-harga="269100" data-gambar="/aset/gambar/drinke-tumblr.webp" data-tipe="pre_order" aria-label="Tambah Chubbi Tumbler ke keranjang">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </button>
          </div>
          <div class="keranjang-mini-card__info">
            <h5 class="keranjang-mini-card__nama">CRSL Chubbi Tumbler Series | Botol minum...</h5>
            <div class="keranjang-mini-card__harga-coret">Rp 319,000</div>
            <div class="keranjang-mini-card__harga-aktif">Rp 269,100</div>
          </div>
        </article>

        <!-- Card 2: Mini Daysic Backpack -->
        <article class="keranjang-mini-card">
          <div class="keranjang-mini-card__media">
            <img src="/aset/gambar/banner-bts.webp" alt="CRSL Mini Daysic Backpack" loading="lazy" width="130" height="130">
            <button type="button" class="keranjang-mini-card__btn-add" data-id="2" data-nama="CRSL Mini Daysic Backpack | Ransel" data-harga="224100" data-gambar="/aset/gambar/banner-bts.webp" data-tipe="regular" aria-label="Tambah Mini Daysic Backpack ke keranjang">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </button>
          </div>
          <div class="keranjang-mini-card__info">
            <h5 class="keranjang-mini-card__nama">CRSL Mini Daysic Backpack | Ransel...</h5>
            <div class="keranjang-mini-card__harga-coret">Rp 279,000</div>
            <div class="keranjang-mini-card__harga-aktif">Rp 224,100</div>
          </div>
        </article>

        <!-- Card 3: Ruby Polo Stripe -->
        <article class="keranjang-mini-card">
          <div class="keranjang-mini-card__media">
            <img src="/aset/gambar/banner-1.webp" alt="CRSL Ruby Polo Stripe" loading="lazy" width="130" height="130">
            <button type="button" class="keranjang-mini-card__btn-add" data-id="5" data-nama="CRSL Ruby Polo Stripe | Polo Shirt Wanita Boxy" data-harga="179100" data-gambar="/aset/gambar/banner-1.webp" data-tipe="regular" aria-label="Tambah Ruby Polo ke keranjang">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </button>
          </div>
          <div class="keranjang-mini-card__info">
            <h5 class="keranjang-mini-card__nama">CRSL Ruby Polo Stripe | Polo Shirt Wanita Boxy...</h5>
            <div class="keranjang-mini-card__harga-coret">Rp 199,000</div>
            <div class="keranjang-mini-card__harga-aktif">Rp 179,100</div>
          </div>
        </article>

        <!-- Card 4: Gravel Mini Mustard Backpack -->
        <article class="keranjang-mini-card">
          <div class="keranjang-mini-card__media">
            <span class="keranjang-mini-card__badge-low">Low Stock</span>
            <img src="/aset/gambar/banner-2.webp" alt="CRSL Gravel Mini Mustard Backpack" loading="lazy" width="130" height="130">
            <button type="button" class="keranjang-mini-card__btn-add" data-id="3" data-nama="CRSL Gravel Mini Mustard Backpack" data-harga="215100" data-gambar="/aset/gambar/banner-2.webp" data-tipe="regular" aria-label="Tambah Gravel Mini Backpack ke keranjang">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </button>
          </div>
          <div class="keranjang-mini-card__info">
            <h5 class="keranjang-mini-card__nama">CRSL Gravel Mini Mustard Backpack...</h5>
            <div class="keranjang-mini-card__harga-coret">Rp 239,000</div>
            <div class="keranjang-mini-card__harga-aktif">Rp 215,100</div>
          </div>
        </article>

      </div>
    </div>

  </div>

  <!-- Footer Drawer Permanen Sticky (Gambar 4) -->
  <div id="keranjang-drawer-footer" class="keranjang-drawer__footer">
    
    <!-- Total Harga & Hemat -->
    <div class="keranjang-drawer__ringkasan-biaya">
      <div class="keranjang-drawer__total-baris">
        <span id="keranjang-total-label" class="keranjang-drawer__total-label">Total Price (0)</span>
        <span id="keranjang-total-nilai" class="keranjang-drawer__total-nilai">Rp 0</span>
      </div>
      <div class="keranjang-drawer__hemat" id="keranjang-hemat-baris" style="display: none;">
        <span>🏷️</span>
        <span id="keranjang-hemat-nilai">Save Rp 0</span>
      </div>
    </div>

    <!-- Progress Loyalitas Eksklusif (Gambar 4) -->
    <div class="keranjang-drawer__loyalty-card">
      <div class="keranjang-drawer__loyalty-teks">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span id="keranjang-loyalty-desc">Spend Rp 200,000 more to reach New Freen</span>
      </div>
      <div class="keranjang-drawer__loyalty-progress-track">
        <div class="keranjang-drawer__loyalty-progress-fill" id="keranjang-loyalty-bar" style="width: 55%;"></div>
      </div>
      <a href="/akun" class="keranjang-drawer__loyalty-link">View Loyalty benefit &rsaquo;</a>
    </div>

    <!-- Tombol Merah Checkout with Discount -->
    <a href="/checkout" class="keranjang-drawer__tombol-checkout" id="keranjang-btn-checkout">
      Checkout with Discount
    </a>

    <p class="keranjang-drawer__loyalty-footer-note">
      Spend 200K to unlock loyalty rewards!
    </p>
  </div>
</aside>

<!-- ========== BAR MELAYANG BAWAH LAYAR (Gambar 1, 2, 3) ========== -->
<div id="keranjang-bar-bawah" class="keranjang-bar-bawah" role="button" tabindex="0" aria-label="Buka keranjang belanja">
  <div class="keranjang-bar-bawah__info">
    <span id="bar-bawah-label" class="keranjang-bar-bawah__label">3 Items in My Cart</span>
    <span id="bar-bawah-harga" class="keranjang-bar-bawah__harga">Rp 558,100</span>
  </div>
  <div class="keranjang-bar-bawah__badge-ikon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    <span id="bar-bawah-badge" class="keranjang-bar-bawah__jumlah-badge">3</span>
  </div>
</div>
