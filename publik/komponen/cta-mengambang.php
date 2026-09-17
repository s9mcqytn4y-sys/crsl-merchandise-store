<?php
/**
 * Komponen CTA Mengambang (Floating Sticky CTAs)
 * - WhatsApp Support CTA (Pojok Kanan Bawah)
 * - Claim Voucher Bouncing CTA (Kanan Tengah - Khusus Beranda)
 */
$apakahBeranda = $apakahBeranda ?? false;
?>
<!-- ========== WHATSAPP SUPPORT FLOATING CTA ========== -->
<div id="cta-wa-wadah" class="cta-wa-wadah">
  <!-- Pop-up Chat Support Card -->
  <div class="cta-wa-popup" role="dialog" aria-modal="false" aria-label="Bantuan WhatsApp">
    <h4 class="cta-wa-popup__judul">Chat Support</h4>
    <p class="cta-wa-popup__teks">We’re available on Whatsapp!</p>
    <a
      href="https://api.whatsapp.com/send?phone=6281234567890&amp;text=Halo%20CRSL%2C%20saya%20ingin%20bertanya%20tentang%20produk"
      target="_blank"
      rel="noopener noreferrer"
      class="cta-wa-popup__tombol"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      Chat us on Whatsapp
    </a>
  </div>

  <!-- Tombol Melayang WA (Ikon bertransformasi jadi X saat terbuka) -->
  <button type="button" id="cta-wa-tombol" class="cta-wa-tombol" aria-label="Buka Chat WhatsApp">
    <!-- Ikon WhatsApp -->
    <svg class="cta-wa-ikon-wa" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <!-- Ikon Silang (X) -->
    <svg class="cta-wa-ikon-tutup" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</div>

<?php if ($apakahBeranda): ?>
<!-- ========== CLAIM VOUCHER BOUNCING CTA (KHUSUS BERANDA) ========== -->
<button
  type="button"
  id="cta-voucher-tombol"
  class="cta-voucher-tombol"
  aria-label="Klaim voucher diskon belanja"
  title="Available Voucher"
>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
</button>

<!-- Modal Available Voucher -->
<div id="modal-voucher-overlay" class="modal-voucher-overlay" aria-hidden="true">
  <div class="modal-voucher" role="dialog" aria-modal="true" aria-labelledby="voucher-judul">
    <div class="modal-voucher__header">
      <h3 id="voucher-judul" class="modal-voucher__judul">Available Voucher</h3>
      <button type="button" id="modal-voucher-tutup" class="modal-voucher__tutup" aria-label="Tutup modal voucher">
        ✕
      </button>
    </div>

    <!-- Desain Kartu Voucher dengan Border Putus-putus -->
    <div class="modal-voucher__kartu">
      <div class="modal-voucher__kartu-kiri">
        <p class="modal-voucher__diskon">Rp 10.000 Off</p>
        <p class="modal-voucher__syarat">Min. Spend Rp 150.000</p>
      </div>
      <div class="modal-voucher__kartu-kanan">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
        <span class="modal-voucher__label-ongkir">FREE ONGKIR</span>
      </div>
    </div>

    <!-- Feedback Voucher Status -->
    <div id="modal-voucher-feedback" class="modal-voucher__feedback">
      Kupon Diskon 10% &amp; Gratis Ongkir berhasil diterapkan!
    </div>

    <!-- Tombol Kapsul Aksi -->
    <button type="button" id="modal-voucher-aksi" class="modal-voucher__tombol-aksi">
      Continue Shopping
    </button>
  </div>
</div>
<?php endif; ?>
