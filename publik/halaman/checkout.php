<?php
/**
 * CRSL Merchandise Store - Halaman Multi-Step Checkout (Fase 4)
 * 3-Step Guided Wizard: Alamat -> Kurir -> Pembayaran & Konfirmasi
 */
?>
<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Checkout Pesanan - CRSL Official Store</title>
  <meta name="description" content="Selesaikan pesanan merchandise resmi CRSL dengan aman, cepat, dan terpercaya.">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/variabel.css">
  <link rel="stylesheet" href="/css/dasar.css">
  <link rel="stylesheet" href="/css/tata-letak.css">
  <link rel="stylesheet" href="/css/komponen/bilah-atas.css">
  <link rel="stylesheet" href="/css/komponen/navigasi.css">
  <link rel="stylesheet" href="/css/komponen/otentikasi.css">
  <link rel="stylesheet" href="/css/halaman/checkout.css">
</head>
<body class="checkout-body">
  <!-- Minimalist Checkout Header -->
  <header class="navigasi" role="banner" style="position: static;">
    <div class="navigasi__wadah">
      <div class="navigasi__kiri">
        <a href="/" class="checkout-header__kembali" aria-label="Kembali ke belanja">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Kembali</span>
        </a>
      </div>
      <div class="navigasi__tengah">
        <a href="/" class="checkout-header__logo" aria-label="CRSL Beranda">
          <img src="/aset/gambar/logo-crsl.png" alt="CRSL" width="90" height="26">
        </a>
      </div>
      <div class="navigasi__kanan" style="display: flex; align-items: center; gap: 0.75rem;">
        <button type="button" id="tombol-tema" class="navigasi__tombol-ikon" aria-label="Ganti tema">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <span class="checkout-header__badge-aman">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>Enkripsi 256-bit</span>
        </span>
      </div>
    </div>
  </header>

  <main class="checkout-page" id="konten-utama">
    <div class="checkout-page__wadah">
      <!-- Stepper Progress Bar -->
      <nav class="checkout-stepper" aria-label="Langkah checkout">
        <div class="checkout-step checkout-step--aktif" id="stepper-tab-1">
          <span class="checkout-step__nomor">1</span>
          <span class="checkout-step__label" data-i18n="checkout.langkah1">1. Alamat &amp; Kontak</span>
        </div>
        <div class="checkout-step" id="stepper-tab-2">
          <span class="checkout-step__nomor">2</span>
          <span class="checkout-step__label" data-i18n="checkout.langkah2">2. Kurir Pengiriman</span>
        </div>
        <div class="checkout-step" id="stepper-tab-3">
          <span class="checkout-step__nomor">3</span>
          <span class="checkout-step__label" data-i18n="checkout.langkah3">3. Metode Pembayaran</span>
        </div>
      </nav>

      <!-- Grid Layout: Formulir Kiri + Ringkasan Kanan -->
      <div class="checkout-layout">
        <!-- Panel Langkah Kiri -->
        <div class="checkout-panel">
          <!-- STEP 1: ALAMAT & KONTAK -->
          <section id="checkout-step-1" class="checkout-step-section">
            <h2 class="checkout-panel__judul">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Informasi Pengiriman &amp; Kontak
            </h2>

            <form id="form-checkout-step-1" novalidate>
              <div class="form-grup-baris">
                <div class="form-kontrol">
                  <label class="form-label" for="input-nama" data-i18n="checkout.nama_lengkap">Nama Penerima *</label>
                  <input type="text" id="input-nama" class="form-input" placeholder="Contoh: Rina Anggraini" required minlength="3">
                  <span class="form-error-teks" id="error-nama">Mohon masukkan nama lengkap minimal 3 huruf.</span>
                </div>
                <div class="form-kontrol">
                  <label class="form-label" for="input-telepon" data-i18n="checkout.telepon">Nomor WhatsApp *</label>
                  <input type="tel" id="input-telepon" class="form-input" placeholder="08xxxxxxxxxx" required pattern="^(\+62|62|0)8[0-9]{8,11}$">
                  <span class="form-error-teks" id="error-telepon">Nomor WhatsApp harus valid (08xx).</span>
                </div>
              </div>

              <div class="form-grup-baris">
                <div class="form-kontrol">
                  <label class="form-label" for="select-provinsi" data-i18n="checkout.provinsi">Provinsi *</label>
                  <select id="select-provinsi" class="form-select" required>
                    <option value="">Pilih Provinsi</option>
                    <option value="DI Yogyakarta" selected>DI Yogyakarta</option>
                    <option value="DKI Jakarta">DKI Jakarta</option>
                    <option value="Jawa Barat">Jawa Barat</option>
                    <option value="Jawa Tengah">Jawa Tengah</option>
                    <option value="Jawa Timur">Jawa Timur</option>
                    <option value="Banten">Banten</option>
                    <option value="Bali">Bali</option>
                    <option value="Sumatera Utara">Sumatera Utara</option>
                  </select>
                </div>
                <div class="form-kontrol">
                  <label class="form-label" for="input-kota" data-i18n="checkout.kota">Kota / Kabupaten *</label>
                  <input type="text" id="input-kota" class="form-input" placeholder="Contoh: Sleman" value="Sleman" required>
                </div>
              </div>

              <div class="form-grup-baris">
                <div class="form-kontrol">
                  <label class="form-label" for="input-kecamatan" data-i18n="checkout.kecamatan">Kecamatan *</label>
                  <input type="text" id="input-kecamatan" class="form-input" placeholder="Contoh: Depok" value="Depok" required>
                </div>
                <div class="form-kontrol">
                  <label class="form-label" for="input-kodepos" data-i18n="checkout.kodepos">Kode Pos (5 Digit) *</label>
                  <input type="text" id="input-kodepos" class="form-input" placeholder="55281" value="55281" required pattern="^\d{5}$" maxlength="5">
                  <span class="form-error-teks" id="error-kodepos">Kode pos harus terdiri dari 5 digit angka.</span>
                </div>
              </div>

              <div class="form-kontrol">
                <label class="form-label" for="input-alamat" data-i18n="checkout.alamat">Alamat Lengkap &amp; Patokan Rumah *</label>
                <textarea id="input-alamat" class="form-textarea" placeholder="Nama jalan, nomor rumah, RT/RW, dan patokan sekitar" required>Jl. Seturan Raya No. 88, Caturtunggal (Samping Kafe Kopi)</textarea>
                <span class="form-error-teks" id="error-alamat">Mohon tuliskan alamat lengkap.</span>
              </div>

              <button type="button" id="btn-ke-step-2" class="btn-checkout-lanjut">
                <span>Lanjut ke Pilihan Kurir</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </form>
          </section>

          <!-- STEP 2: KURIR PENGIRIMAN -->
          <section id="checkout-step-2" class="checkout-step-section" style="display: none;">
            <h2 class="checkout-panel__judul">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Pilih Layanan Pengiriman
            </h2>

            <div class="opsi-kurir-grid" id="kurir-selector">
              <!-- JNE Reguler -->
              <label class="opsi-kurir-kartu opsi-kurir-kartu--terpilih">
                <div class="opsi-kurir-kartu__kiri">
                  <input type="radio" name="kurir" value="JNE-REG" data-nama="JNE Reguler" data-tarif="18000" data-estimasi="2-3 Hari Kerja" checked>
                  <div>
                    <div class="opsi-kurir-kartu__nama">JNE Reguler</div>
                    <div class="opsi-kurir-kartu__estimasi">Estimasi tiba 2–3 hari kerja</div>
                  </div>
                </div>
                <div class="opsi-kurir-kartu__tarif">Rp 18.000</div>
              </label>

              <!-- JNE YES -->
              <label class="opsi-kurir-kartu">
                <div class="opsi-kurir-kartu__kiri">
                  <input type="radio" name="kurir" value="JNE-YES" data-nama="JNE YES (Yakin Esok Sampai)" data-tarif="32000" data-estimasi="1 Hari Kerja">
                  <div>
                    <div class="opsi-kurir-kartu__nama">JNE YES (Next Day)</div>
                    <div class="opsi-kurir-kartu__estimasi">Estimasi tiba 1 hari kerja</div>
                  </div>
                </div>
                <div class="opsi-kurir-kartu__tarif">Rp 32.000</div>
              </label>

              <!-- SiCepat REG -->
              <label class="opsi-kurir-kartu">
                <div class="opsi-kurir-kartu__kiri">
                  <input type="radio" name="kurir" value="SICEPAT-REG" data-nama="SiCepat REG" data-tarif="17000" data-estimasi="2-3 Hari Kerja">
                  <div>
                    <div class="opsi-kurir-kartu__nama">SiCepat REG</div>
                    <div class="opsi-kurir-kartu__estimasi">Estimasi tiba 2–3 hari kerja</div>
                  </div>
                </div>
                <div class="opsi-kurir-kartu__tarif">Rp 17.000</div>
              </label>

              <!-- J&T Express -->
              <label class="opsi-kurir-kartu">
                <div class="opsi-kurir-kartu__kiri">
                  <input type="radio" name="kurir" value="JNT-EZ" data-nama="J&T Express" data-tarif="19000" data-estimasi="2-3 Hari Kerja">
                  <div>
                    <div class="opsi-kurir-kartu__nama">J&amp;T Express</div>
                    <div class="opsi-kurir-kartu__estimasi">Estimasi tiba 2–3 hari kerja</div>
                  </div>
                </div>
                <div class="opsi-kurir-kartu__tarif">Rp 19.000</div>
              </label>
            </div>

            <!-- Asuransi Pengiriman -->
            <div style="margin-top: 1.25rem; padding: 1rem; background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: var(--radius-md);">
              <label style="display: flex; align-items: flex-start; gap: 0.6rem; cursor: pointer;">
                <input type="checkbox" id="check-asuransi" checked style="margin-top: 0.25rem;">
                <div>
                  <div style="font-weight: 700; font-size: 0.9rem;" data-i18n="checkout.asuransi">Asuransi Pengiriman (+Rp 2.000)</div>
                  <div style="font-size: 0.8rem; color: var(--warna-teks-redup);" data-i18n="checkout.asuransi_info">Melindungi paket dari kerusakan atau kehilangan fisik selama perjalanan</div>
                </div>
              </label>
            </div>

            <div class="checkout-tombol-navigasi">
              <button type="button" id="btn-kembali-step-1" class="btn-checkout-kembali-step">Kembali</button>
              <button type="button" id="btn-ke-step-3" class="btn-checkout-lanjut">
                <span>Lanjut ke Pembayaran</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </section>

          <!-- STEP 3: METODE PEMBAYARAN -->
          <section id="checkout-step-3" class="checkout-step-section" style="display: none;">
            <h2 class="checkout-panel__judul">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Pilih Metode Pembayaran
            </h2>

            <div class="opsi-bayar-grid" id="bayar-selector">
              <!-- QRIS Dinamis -->
              <label class="opsi-bayar-kartu opsi-bayar-kartu--terpilih">
                <div class="opsi-bayar-kartu__kiri">
                  <input type="radio" name="metode_bayar" value="QRIS" checked>
                  <div>
                    <div class="opsi-bayar-kartu__nama">QRIS Dinamis (Semua E-Wallet &amp; Mobile Banking)</div>
                    <div style="font-size: 0.8rem; color: var(--warna-teks-redup);">BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay</div>
                  </div>
                </div>
                <span class="opsi-bayar-kartu__badge">Instan</span>
              </label>

              <!-- BCA Virtual Account -->
              <label class="opsi-bayar-kartu">
                <div class="opsi-bayar-kartu__kiri">
                  <input type="radio" name="metode_bayar" value="BCA-VA">
                  <div>
                    <div class="opsi-bayar-kartu__nama">BCA Virtual Account</div>
                    <div style="font-size: 0.8rem; color: var(--warna-teks-redup);">Verifikasi otomatis 24 jam</div>
                  </div>
                </div>
                <span class="opsi-bayar-kartu__badge">Otomatis</span>
              </label>

              <!-- COD -->
              <label class="opsi-bayar-kartu">
                <div class="opsi-bayar-kartu__kiri">
                  <input type="radio" name="metode_bayar" value="COD">
                  <div>
                    <div class="opsi-bayar-kartu__nama">Cash on Delivery (COD)</div>
                    <div style="font-size: 0.8rem; color: var(--warna-teks-redup);">Bayar tunai ke kurir saat paket diterima</div>
                  </div>
                </div>
                <span style="font-size: 0.75rem; color: var(--warna-teks-redup);">Verifikasi SMS</span>
              </label>
            </div>

            <!-- QRIS Interactive Preview Box -->
            <div class="qris-display-box aktif" id="qris-preview-box">
              <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem;">Pindai QRIS untuk Menyelesaikan Pesanan</h3>
              <!-- Simulasi SVG QR Code CRSL -->
              <svg class="qris-qrcode" viewBox="0 0 100 100" fill="#000000">
                <rect width="100" height="100" fill="#ffffff"/>
                <!-- Corner 1 -->
                <rect x="10" y="10" width="25" height="25" fill="#000000"/>
                <rect x="15" y="15" width="15" height="15" fill="#ffffff"/>
                <rect x="18" y="18" width="9" height="9" fill="#e52027"/>
                <!-- Corner 2 -->
                <rect x="65" y="10" width="25" height="25" fill="#000000"/>
                <rect x="70" y="15" width="15" height="15" fill="#ffffff"/>
                <rect x="73" y="18" width="9" height="9" fill="#e52027"/>
                <!-- Corner 3 -->
                <rect x="10" y="65" width="25" height="25" fill="#000000"/>
                <rect x="15" y="70" width="15" height="15" fill="#ffffff"/>
                <rect x="18" y="73" width="9" height="9" fill="#e52027"/>
                <!-- Pixel Pattern -->
                <rect x="42" y="12" width="6" height="6"/>
                <rect x="52" y="18" width="6" height="6"/>
                <rect x="42" y="28" width="6" height="6"/>
                <rect x="48" y="38" width="10" height="10" fill="#e52027"/>
                <rect x="65" y="45" width="6" height="6"/>
                <rect x="75" y="55" width="6" height="6"/>
                <rect x="40" y="65" width="6" height="6"/>
                <rect x="50" y="75" width="6" height="6"/>
                <rect x="65" y="80" width="6" height="6"/>
              </svg>
              <div class="qris-timer" id="qris-countdown">Waktu tersisa: 14:59</div>
              <p style="font-size: 0.8rem; color: var(--warna-teks-redup); margin-top: 0.25rem;">
                Mendukung BCA Mobile, Livin by Mandiri, GoPay, OVO, Dana, ShopeePay
              </p>
            </div>

            <div class="checkout-tombol-navigasi">
              <button type="button" id="btn-kembali-step-2" class="btn-checkout-kembali-step">Kembali</button>
              <button type="button" id="btn-bayar-sekarang" class="btn-checkout-lanjut">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                <span id="btn-bayar-label">Bayar Sekarang</span>
              </button>
            </div>

            <p class="checkout-legal-notice" data-i18n="checkout.setuju_syarat">
              Dengan melanjutkan, Anda menyetujui Syarat &amp; Ketentuan Transaksi serta Kebijakan Privasi resmi CRSL.
            </p>
          </section>
        </div>

        <!-- Panel Ringkasan Pembayaran Kanan -->
        <aside class="checkout-ringkasan">
          <h3 class="checkout-ringkasan__judul" data-i18n="checkout.ringkasan">Ringkasan Pesanan</h3>

          <div class="checkout-daftar-item" id="checkout-daftar-item">
            <!-- Diisi otomatis dari data keranjang -->
          </div>

          <div class="checkout-kalkulasi">
            <div class="checkout-kalkulasi__baris">
              <span data-i18n="checkout.subtotal">Subtotal Produk</span>
              <span id="kalkulasi-subtotal">Rp 0</span>
            </div>
            <div class="checkout-kalkulasi__baris">
              <span data-i18n="checkout.ongkir">Ongkos Kirim (<span id="kalkulasi-kurir-label">JNE Reguler</span>)</span>
              <span id="kalkulasi-ongkir">Rp 18.000</span>
            </div>
            <div class="checkout-kalkulasi__baris">
              <span>Asuransi &amp; Biaya Layanan</span>
              <span id="kalkulasi-layanan">Rp 3.000</span>
            </div>
            <div class="checkout-kalkulasi__baris checkout-kalkulasi__baris--total">
              <span data-i18n="checkout.total">Total Tagihan</span>
              <span id="kalkulasi-total">Rp 0</span>
            </div>
          </div>

          <div style="font-size: 0.8rem; color: var(--warna-teks-redup); text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
            <span>🛡️</span>
            <span>Jaminan 100% Produk Asli CRSL Animals as your Bestfriends!</span>
          </div>
        </aside>
      </div>
    </div>
  </main>

  <!-- Modal Otentikasi Instan -->
  <?php require_once PUBLIK_DIR . '/komponen/modal-otentikasi.php'; ?>

  <!-- Modal Simulator Pembayaran QRIS / VA -->
  <div class="modal-overlay" id="modal-simulator-bayar" aria-hidden="true" style="display: none;">
    <div class="modal-wadah modal-wadah--sedang" style="text-align: center; padding: 2rem; max-width: 440px; margin: auto;">
      <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📱</div>
      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;" id="simulasi-judul">Menunggu Pembayaran QRIS</h3>
      <p style="font-size: 0.85rem; color: var(--warna-teks-redup); margin-bottom: 1rem;" id="simulasi-instruksi">
        Pindai kode QR menggunakan aplikasi e-wallet atau mobile banking apa pun.
      </p>
      <div style="display: inline-block; padding: 1rem; background: #ffffff; border-radius: var(--radius-lg); border: 1px solid var(--warna-batas); margin-bottom: 1rem;">
        <svg width="180" height="180" viewBox="0 0 100 100" fill="none" style="display: block;">
          <rect width="100" height="100" fill="#ffffff"/>
          <path d="M10 10h30v30h-30z M60 10h30v30h-30z M10 60h30v30h-30z" fill="#000000"/>
          <path d="M16 16h18v18h-18z M66 16h18v18h-18z M16 66h18v18h-18z" fill="#ffffff"/>
          <path d="M22 22h6v6h-6z M72 22h6v6h-6z M22 72h6v6h-6z" fill="#000000"/>
          <path d="M45 10h10v10h-10z M45 25h10v10h-10z M45 40h10v10h-10z M10 45h35v10h-35z M60 45h30v10h-30z M45 60h10v30h-10z M60 60h10v15h-10z M75 60h15v10h-15z M60 80h30v10h-30z" fill="#000000"/>
        </svg>
      </div>
      <div style="font-weight: 700; font-size: 1.15rem; color: var(--warna-primer); margin-bottom: 0.25rem;" id="simulasi-total">
        Rp 0
      </div>
      <div style="font-size: 0.85rem; color: var(--warna-peringatan); font-weight: 600; margin-bottom: 1.5rem;" id="simulasi-timer">
        Waktu tersisa: 14:59
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <button type="button" id="btn-simulasi-sukses" class="checkout-step__tombol checkout-step__tombol--utama" style="width: 100%;">
          Simulasi Pembayaran Berhasil
        </button>
        <button type="button" id="btn-tutup-simulasi" class="checkout-step__tombol" style="width: 100%; background: transparent; border: 1px solid var(--warna-batas); color: var(--warna-teks-redup);">
          Bayar Nanti (Buka Faktur)
        </button>
      </div>
    </div>
  </div>

  <!-- JS -->
  <script src="/js/utilitas/i18n.js"></script>
  <script src="/js/komponen/navigasi.js"></script>
  <script src="/js/komponen/otentikasi.js"></script>
  <script src="/js/halaman/checkout.js"></script>
</body>
</html>
