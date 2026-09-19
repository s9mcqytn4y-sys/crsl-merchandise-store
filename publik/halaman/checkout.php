<?php
/**
 * CRSL Merchandise Store - Halaman Checkout Tunggal (Single-Page 2-Kolom)
 * Kepatuhan penuh referensi resmi crsl-store.id/checkout/16923671
 * - Tanpa sistem wizard bertingkat (Single Unified Flow)
 * - Kolom Kiri: Alamat (Modal Pilih & Edit), Kurir (Modal + Asuransi 100%), Pembayaran (Modal Logo)
 * - Kolom Kanan: Ringkasan Produk, Voucher, Koin, Rincian Biaya, Tombol Bayar
 * - Stateful Back Navigation: Mengembalikan ke PDP terakhir dengan preservasi input
 */
?>
<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Checkout Pesanan - CRSL Official Store</title>
  <meta name="description" content="Selesaikan pesanan merchandise resmi CRSL dengan aman, cepat, dan terpercaya.">
  <link rel="icon" type="image/svg+xml" href="/aset/ikon/favicon.svg">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/variabel.css">
  <link rel="stylesheet" href="/css/dasar.css">
  <link rel="stylesheet" href="/css/tata-letak.css">
  <link rel="stylesheet" href="/css/komponen/bilah-atas.css">
  <link rel="stylesheet" href="/css/komponen/navigasi.css">
  <link rel="stylesheet" href="/css/komponen/footer.css">
  <link rel="stylesheet" href="/css/halaman/checkout.css">
</head>
<body class="checkout-body">

  <!-- Header Minimalis Checkout -->
  <header class="checkout-header" role="banner">
    <div class="checkout-header__wadah">
      <div class="checkout-header__kiri">
        <a href="javascript:void(0)" id="checkout-btn-back" class="checkout-header__btn-back" aria-label="Kembali ke halaman sebelumnya">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </a>
      </div>
      <div class="checkout-header__tengah">
        <a href="/" class="checkout-header__logo" aria-label="CRSL Beranda">
          <img src="/aset/gambar/logo-crsl.png" alt="CRSL" width="92" height="28">
        </a>
      </div>
      <div class="checkout-header__kanan">
        <span class="checkout-header__badge-aman" title="Transaksi Terenkripsi Aman">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Enkripsi 256-bit</span>
        </span>
      </div>
    </div>
  </header>

  <!-- Konten Utama Checkout 2-Kolom -->
  <main class="checkout-main" id="konten-utama">
    <div class="checkout-kontainer">

      <!-- ================= KOLOM KIRI ================= -->
      <div class="checkout-kolom-kiri">

        <!-- 1. Address Details -->
        <section class="checkout-seksi" aria-labelledby="judul-alamat">
          <h2 id="judul-alamat" class="checkout-seksi__judul">Address Details</h2>
          
          <div class="checkout-card-alamat" id="checkout-card-alamat">
            <div class="checkout-card-alamat__header">
              <div class="checkout-card-alamat__nama" id="tampil-nama-penerima">abdul music</div>
              <button type="button" class="checkout-btn-ubah" id="btn-buka-modal-pilih-alamat">Change</button>
            </div>
            <div class="checkout-card-alamat__telepon" id="tampil-telepon-penerima">+628567060477</div>
            <div class="checkout-card-alamat__detail" id="tampil-detail-alamat">Jakarta Pusat, Johar Baru, johar baru johar baru</div>
          </div>

          <label class="checkout-dropship-wrap">
            <input type="checkbox" id="checkout-is-dropship" class="checkout-checkbox">
            <span class="checkout-dropship-label">Make as a dropship order</span>
          </label>
        </section>

        <!-- 2. Shipment Method -->
        <section class="checkout-seksi" aria-labelledby="judul-kurir">
          <h2 id="judul-kurir" class="checkout-seksi__judul">Shipment Method</h2>

          <div class="checkout-card-interaktif" id="btn-buka-modal-kurir" role="button" tabindex="0" aria-label="Pilih metode pengiriman">
            <div class="checkout-card-interaktif__kiri">
              <img src="/aset/ikon/kurir-jne.svg" alt="JNE" class="checkout-card-interaktif__logo" id="tampil-kurir-logo" width="80" height="26">
              <div class="checkout-card-interaktif__info">
                <div class="checkout-card-interaktif__nama" id="tampil-kurir-nama">JNE Reguler (2 - 3 days)</div>
              </div>
            </div>
            <div class="checkout-card-interaktif__kanan">
              <span class="checkout-card-interaktif__harga" id="tampil-kurir-biaya">Rp 16,000</span>
              <svg class="checkout-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </section>

        <!-- 3. Payment Method -->
        <section class="checkout-seksi" aria-labelledby="judul-bayar">
          <h2 id="judul-bayar" class="checkout-seksi__judul">Payment Method</h2>

          <div class="checkout-card-interaktif" id="btn-buka-modal-bayar" role="button" tabindex="0" aria-label="Pilih metode pembayaran">
            <div class="checkout-card-interaktif__kiri">
              <img src="/aset/ikon/pembayaran-qris.svg" alt="QRIS" class="checkout-card-interaktif__logo" id="tampil-bayar-logo" width="75" height="26">
              <div class="checkout-card-interaktif__info">
                <div class="checkout-card-interaktif__nama" id="tampil-bayar-nama">QRIS</div>
              </div>
            </div>
            <div class="checkout-card-interaktif__kanan">
              <span class="checkout-card-interaktif__status" id="tampil-bayar-status">Instant</span>
              <svg class="checkout-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </section>

      </div>

      <!-- ================= KOLOM KANAN ================= -->
      <div class="checkout-kolom-kanan">

        <div class="checkout-ringkasan-box">
          <!-- Daftar Produk Pesanan -->
          <div class="checkout-item-list" id="checkout-item-list">
            <!-- Dinamis dirender dari localStorage / state -->
          </div>

          <!-- Opsi Tambahan -->
          <div class="checkout-opsi-list">
            <div class="checkout-opsi-row" id="btn-buka-catatan" role="button" tabindex="0">
              <span>Leave a message for delivery (Optional)</span>
              <svg class="checkout-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
            <div id="checkout-catatan-input-wrap" style="display:none; padding: 0 0.5rem 0.5rem;">
              <input type="text" id="checkout-catatan-pengiriman" class="checkout-input-text" placeholder="Contoh: Titipkan di pos satpam jika tidak ada orang di rumah.">
            </div>

            <div class="checkout-opsi-row" id="btn-buka-voucher" role="button" tabindex="0">
              <div class="checkout-opsi-row__kiri">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
                </svg>
                <span id="tampil-voucher-terpasang">Vouchers</span>
              </div>
              <svg class="checkout-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
            <div id="checkout-voucher-input-wrap" style="display:none; padding: 0 0.5rem 0.75rem; gap: 6px;">
              <div style="display:flex; gap:6px;">
                <input type="text" id="input-kode-voucher" class="checkout-input-text" placeholder="Ketik kode kupon (contoh: NEWADOPTER10)">
                <button type="button" id="btn-apply-voucher" class="checkout-btn-voucher-apply">Apply</button>
              </div>
              <div id="pesan-feedback-voucher" style="font-size: 12px; margin-top: 4px; display: none;"></div>
            </div>

            <label class="checkout-opsi-row checkout-opsi-row--loyalty">
              <span>Use Loyalty Point (P 0)</span>
              <input type="checkbox" id="checkout-use-points" class="checkout-checkbox" disabled>
            </label>
          </div>

          <!-- Rincian Biaya Transparan -->
          <div class="checkout-rincian-biaya">
            <div class="checkout-rincian-baris">
              <span id="label-subtotal-items">Subtotal &bull; 1 items</span>
              <span class="checkout-rincian-val" id="val-subtotal">Rp 199.000</span>
            </div>
            <div class="checkout-rincian-baris checkout-rincian-baris--diskon">
              <span>Product Discount</span>
              <span class="checkout-rincian-val" id="val-diskon-produk">-Rp 19.900</span>
            </div>
            <div class="checkout-rincian-baris">
              <span id="label-shipping-berat">Shipping &bull; 0.5kg</span>
              <span class="checkout-rincian-val" id="val-ongkir">Rp 16.000</span>
            </div>
            <div class="checkout-rincian-sub">
              Shipping might be charged by volumetric weight, based on parcel size rather than actual weight.
            </div>
            <div class="checkout-rincian-baris" id="baris-asuransi">
              <span>Shipment Insurance Fee</span>
              <span class="checkout-rincian-val" id="val-asuransi">Rp 2.500</span>
            </div>

            <div class="checkout-rincian-total">
              <span class="checkout-total-label">Total Payment</span>
              <span class="checkout-total-val" id="val-total-bayar">Rp 197.600</span>
            </div>
          </div>

          <!-- Tombol Bayar Sekarang -->
          <button type="button" class="checkout-btn-bayar" id="btn-proses-pesanan">
            Bayar Sekarang
          </button>

          <!-- Security note -->
          <div class="checkout-security-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Secure Payment | Your payment is encrypted.</span>
          </div>

        </div>

      </div>

    </div>
  </main>

  <!-- =======================================================
       MODAL 1: SELECT DELIVERY INFORMATION (Screenshot 3)
       ======================================================= -->
  <div class="checkout-modal-overlay" id="modal-select-address-overlay" aria-hidden="true" style="display:none;">
    <div class="checkout-modal-card" role="dialog" aria-modal="true" aria-labelledby="judul-modal-select-address">
      <div class="checkout-modal-header">
        <h3 id="judul-modal-select-address" class="checkout-modal-title">Select Delivery Information</h3>
        <button type="button" class="checkout-modal-close" id="btn-tutup-modal-select-address" aria-label="Tutup modal">&times;</button>
      </div>
      <div class="checkout-modal-body">
        <div class="checkout-alamat-list-pilihan" id="container-daftar-alamat-tersimpan">
          <!-- Dinamis di-render oleh checkout.js -->
        </div>
        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end;">
          <button type="button" class="checkout-btn-add-new-address" id="btn-buka-modal-tambah-alamat">
            + Add New
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- =======================================================
       MODAL 2: EDIT / TAMBAH DELIVERY INFORMATION (Screenshot 4)
       ======================================================= -->
  <div class="checkout-modal-overlay" id="modal-edit-address-overlay" aria-hidden="true" style="display:none;">
    <div class="checkout-modal-card checkout-modal-card--form" role="dialog" aria-modal="true" aria-labelledby="judul-modal-edit-address">
      <div class="checkout-modal-header">
        <h3 id="judul-modal-edit-address" class="checkout-modal-title">Edit Delivery Information</h3>
        <button type="button" class="checkout-modal-close" id="btn-tutup-modal-edit-address" aria-label="Tutup modal">&times;</button>
      </div>
      <form id="form-edit-alamat" class="checkout-modal-body checkout-form-alamat">
        <div class="checkout-field-group">
          <label for="input-alamat-email">Email*</label>
          <input type="email" id="input-alamat-email" class="checkout-input-text" required value="abdulmusic543@gmail.com">
          <span class="checkout-field-hint">We will send your order detail to your email</span>
        </div>

        <div class="checkout-field-group">
          <label for="input-alamat-nama">Recipient Full Name</label>
          <input type="text" id="input-alamat-nama" class="checkout-input-text" required value="abdul music">
        </div>

        <div class="checkout-field-group">
          <label for="input-alamat-telepon">Recipient Phone Number</label>
          <input type="tel" id="input-alamat-telepon" class="checkout-input-text" required value="08567060477">
        </div>

        <div class="checkout-field-group">
          <label for="input-alamat-negara">Country</label>
          <select id="input-alamat-negara" class="checkout-input-select">
            <option value="Indonesia" selected>Indonesia</option>
          </select>
        </div>

        <div class="checkout-field-group">
          <label for="input-alamat-kota">Sub-district, District, City</label>
          <div class="checkout-input-icon-wrap">
            <input type="text" id="input-alamat-kota" class="checkout-input-text" required value="Johar Baru, Jakarta Pusat, DKI Jakarta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="checkout-input-icon">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>

        <div class="checkout-field-group">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label for="input-alamat-detail">Address Details</label>
            <span class="checkout-char-counter" id="alamat-char-count">21 / 250</span>
          </div>
          <textarea id="input-alamat-detail" class="checkout-input-textarea" rows="3" maxlength="250" required>johar baru johar baru</textarea>
        </div>

        <div class="checkout-form-actions">
          <button type="button" class="checkout-btn-batal" id="btn-batal-edit-alamat">Cancel</button>
          <button type="submit" class="checkout-btn-simpan">Save</button>
        </div>
      </form>
    </div>
  </div>

  <!-- =======================================================
       MODAL 3: SHIPMENT METHOD (Screenshot 5)
       ======================================================= -->
  <div class="checkout-modal-overlay" id="modal-shipment-overlay" aria-hidden="true" style="display:none;">
    <div class="checkout-modal-card" role="dialog" aria-modal="true" aria-labelledby="judul-modal-shipment">
      <div class="checkout-modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" class="checkout-modal-back-btn" id="btn-kembali-modal-shipment" aria-label="Kembali">&larr;</button>
          <h3 id="judul-modal-shipment" class="checkout-modal-title">Shipment Method</h3>
        </div>
        <button type="button" class="checkout-modal-close" id="btn-tutup-modal-shipment" aria-label="Tutup modal">&times;</button>
      </div>
      <div class="checkout-modal-body">
        <p class="checkout-modal-subtitle">Recommended for you!</p>

        <div class="checkout-opsi-kurir-group">
          <!-- Opsi 1: JNE Reguler -->
          <label class="checkout-radio-kurir-card" for="radio-kurir-reguler">
            <div class="checkout-radio-kurir-kiri">
              <input type="radio" name="pilihan_kurir" id="radio-kurir-reguler" value="jne_reg" checked>
              <img src="/aset/ikon/kurir-jne.svg" alt="JNE" width="65" height="24">
              <div>
                <div class="checkout-kurir-nama-baris">
                  <strong>JNE</strong>
                  <span class="checkout-kurir-badge-chip">Cheapest</span>
                </div>
                <div class="checkout-kurir-estimasi-teks">Reguler (2 - 3 days)</div>
              </div>
            </div>
            <div class="checkout-radio-kurir-kanan">
              <strong>Rp 16,000</strong>
            </div>
          </label>
          <div class="checkout-asuransi-subbox">
            <label class="checkout-asuransi-label">
              <input type="checkbox" id="checkbox-asuransi-pengiriman" checked>
              <span>100% refund insurance <strong style="color:#e52027;">+Rp 2,500</strong></span>
            </label>
            <p class="checkout-asuransi-ket">Without insurance, loss refunds are limited to 10x shipping fee.</p>
          </div>

          <!-- Opsi 2: JNE YES -->
          <label class="checkout-radio-kurir-card" for="radio-kurir-yes" style="margin-top: 1rem;">
            <div class="checkout-radio-kurir-kiri">
              <input type="radio" name="pilihan_kurir" id="radio-kurir-yes" value="jne_yes">
              <img src="/aset/ikon/kurir-jne.svg" alt="JNE" width="65" height="24">
              <div>
                <div class="checkout-kurir-nama-baris">
                  <strong>JNE</strong>
                  <span class="checkout-kurir-badge-chip">Fastest</span>
                </div>
                <div class="checkout-kurir-estimasi-teks">YES (Yakin Esok Sampai) (1 days)</div>
              </div>
            </div>
            <div class="checkout-radio-kurir-kanan">
              <strong>Rp 39,000</strong>
            </div>
          </label>
        </div>

        <button type="button" class="checkout-btn-konfirmasi" id="btn-konfirmasi-kurir">
          Confirm
        </button>
      </div>
    </div>
  </div>

  <!-- =======================================================
       MODAL 4: PAYMENT METHOD SELECTOR
       ======================================================= -->
  <div class="checkout-modal-overlay" id="modal-payment-overlay" aria-hidden="true" style="display:none;">
    <div class="checkout-modal-card" role="dialog" aria-modal="true" aria-labelledby="judul-modal-payment">
      <div class="checkout-modal-header">
        <h3 id="judul-modal-payment" class="checkout-modal-title">Select Payment Method</h3>
        <button type="button" class="checkout-modal-close" id="btn-tutup-modal-payment" aria-label="Tutup modal">&times;</button>
      </div>
      <div class="checkout-modal-body">
        <div class="checkout-pembayaran-list">
          <label class="checkout-radio-metode-card">
            <input type="radio" name="pilihan_metode_bayar" value="qris" checked>
            <img src="/aset/ikon/pembayaran-qris.svg" alt="QRIS" width="70" height="24">
            <div>
              <div class="checkout-metode-nama">QRIS (Semua E-Wallet &amp; Mobile Banking)</div>
              <div class="checkout-metode-sub">Verifikasi Otomatis Instan</div>
            </div>
          </label>

          <label class="checkout-radio-metode-card">
            <input type="radio" name="pilihan_metode_bayar" value="bca">
            <img src="/aset/ikon/pembayaran-bca.svg" alt="BCA" width="70" height="24">
            <div>
              <div class="checkout-metode-nama">BCA Virtual Account</div>
              <div class="checkout-metode-sub">Bayar dari m-BCA / KlikBCA</div>
            </div>
          </label>

          <label class="checkout-radio-metode-card">
            <input type="radio" name="pilihan_metode_bayar" value="mandiri">
            <img src="/aset/ikon/pembayaran-mandiri.svg" alt="Mandiri" width="70" height="24">
            <div>
              <div class="checkout-metode-nama">Mandiri Virtual Account</div>
              <div class="checkout-metode-sub">Bayar via Livin' by Mandiri</div>
            </div>
          </label>

          <label class="checkout-radio-metode-card">
            <input type="radio" name="pilihan_metode_bayar" value="gopay">
            <img src="/aset/ikon/pembayaran-gopay.svg" alt="GoPay" width="70" height="24">
            <div>
              <div class="checkout-metode-nama">GoPay</div>
              <div class="checkout-metode-sub">Scan QR GoPay / Pembayaran Aplikasi</div>
            </div>
          </label>

          <label class="checkout-radio-metode-card">
            <input type="radio" name="pilihan_metode_bayar" value="cod">
            <div style="font-weight:900; color:#e52027; width:70px; text-align:center;">COD</div>
            <div>
              <div class="checkout-metode-nama">Cash on Delivery (Bayar di Tempat)</div>
              <div class="checkout-metode-sub">Bayar tunai ke kurir saat barang tiba</div>
            </div>
          </label>
        </div>

        <button type="button" class="checkout-btn-konfirmasi" id="btn-konfirmasi-payment">
          Confirm
        </button>
      </div>
    </div>
  </div>

  <?php require_once PUBLIK_DIR . '/komponen/footer.php'; ?>

  <!-- Scripts -->
  <script src="/js/utilitas/i18n.js"></script>
  <script src="/js/komponen/keranjang.js"></script>
  <script src="/js/halaman/checkout.js"></script>
</body>
</html>
