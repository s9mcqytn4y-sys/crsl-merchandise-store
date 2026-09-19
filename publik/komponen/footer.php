<?php
/**
 * Komponen Footer Terpadu - CRSL Merchandise Store
 * Kepatuhan: WCAG 2.2 AA, /antislop-layoutmobile, Semantic HTML5
 */
?>
<footer class="footer" role="contentinfo">
  <div class="footer__wadah">
    
    <!-- Kolom 1: Profil Brand & Karakter -->
    <div class="footer__kolom footer__kolom--brand">
      <a href="/" class="footer__logo-link" aria-label="CRSL Official Store">
        <img src="/aset/gambar/logo-crsl.png" alt="CRSL Official" class="footer__logo" width="120" height="32" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';">
        <span class="footer__logo-teks" style="display:none;">CRSL</span>
      </a>
      <p class="footer__deskripsi">
        Animals as your Bestfriends! Menyediakan ragam merchandise, pakaian, tas ransel, tumbler, dan aksesoris karakter hewan orisinal: Odin, Chilo, Popo, Choco, dan Pigko.
      </p>
      <div class="footer__sosial" aria-label="Media sosial resmi">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="footer__sosial-link" aria-label="Instagram CRSL">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" class="footer__sosial-link" aria-label="TikTok CRSL">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
        </a>
        <a href="https://api.whatsapp.com/send?phone=6281234567890" target="_blank" rel="noopener noreferrer" class="footer__sosial-link" aria-label="WhatsApp Official CRSL">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </a>
      </div>
    </div>

    <!-- Kolom 2: Navigasi Cepat -->
    <div class="footer__kolom">
      <h3 class="footer__judul-kolom">Navigasi</h3>
      <ul class="footer__tautan-list">
        <li><a href="/products" class="footer__tautan">Semua Produk</a></li>
        <li><a href="/bundle/back-to-school-with-miflo" class="footer__tautan">BTS Must-Have Bundle</a></li>
        <li><a href="/produk/crsl-drinke-tumblr-series" class="footer__tautan">Pre-Order Now</a></li>
        <li><a href="/kategori/backpack-collection" class="footer__tautan">Backpack Collection</a></li>
        <li><a href="/kategori/slingbag-collection" class="footer__tautan">Slingbag Collection</a></li>
        <li><a href="/kategori/tumbler-collection" class="footer__tautan">Tumbler Collection</a></li>
      </ul>
    </div>

    <!-- Kolom 3: Layanan & Informasi -->
    <div class="footer__kolom">
      <h3 class="footer__judul-kolom">Bantuan &amp; Info</h3>
      <ul class="footer__tautan-list">
        <li><a href="/akun" class="footer__tautan">Akun Saya &amp; Pesanan</a></li>
        <li><a href="#modal-terms-overlay" class="footer__tautan" onclick="const m=document.getElementById('modal-terms-overlay'); if(m){m.classList.add('aktif');} return false;">Syarat &amp; Ketentuan</a></li>
        <li><a href="#modal-terms-overlay" class="footer__tautan" onclick="alert('Kebijakan Privasi CRSL: Kami melindungi data pribadi Anda dengan standar keamanan perbankan dan tidak membagikan data kepada pihak ketiga.'); return false;">Kebijakan Privasi</a></li>
        <li><a href="https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20CRSL%20Helpdesk" target="_blank" rel="noopener noreferrer" class="footer__tautan">Bantuan &amp; FAQ</a></li>
      </ul>
    </div>

    <!-- Kolom 4: Pembayaran & Kurir Pengiriman -->
    <div class="footer__kolom footer__kolom--metode">
      <h3 class="footer__judul-kolom">Metode Pembayaran</h3>
      <div class="footer__badge-list">
        <span class="footer__badge-mitra" title="QRIS Instant Payment">QRIS</span>
        <span class="footer__badge-mitra" title="Bank BCA">BCA</span>
        <span class="footer__badge-mitra" title="Bank Mandiri">Mandiri</span>
        <span class="footer__badge-mitra" title="Bank BNI">BNI</span>
        <span class="footer__badge-mitra" title="Bank BRI">BRI</span>
        <span class="footer__badge-mitra" title="GoPay">GoPay</span>
        <span class="footer__badge-mitra" title="Cash on Delivery">COD</span>
      </div>

      <h3 class="footer__judul-kolom" style="margin-top: 1.25rem;">Jasa Ekspedisi</h3>
      <div class="footer__badge-list">
        <span class="footer__badge-mitra" title="JNE Express">JNE Reg / YES</span>
        <span class="footer__badge-mitra" title="SiCepat Express">SiCepat</span>
        <span class="footer__badge-mitra" title="J&T Express">J&amp;T</span>
      </div>
    </div>

  </div>

  <!-- Bar Bawah Copyright -->
  <div class="footer__bawah">
    <div class="footer__bawah-wadah">
      <p class="footer__copyright">&copy; 2026 CRSL Official Store. All rights reserved.</p>
      <p class="footer__tagline">Crafted with care in Yogyakarta, Indonesia</p>
    </div>
  </div>
</footer>
