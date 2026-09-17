<?php
/**
 * Komponen Modal Otentikasi
 * - Modal Login (Gambar 4 & 5)
 * - Modal Register dengan 3 dropdown tanggal lahir (Gambar 5)
 * - Modal Verify Accounts 6 digit dengan old_value restore
 */
?>
<!-- ========== MODAL LOGIN (Gambar 4 & 5) ========== -->
<div class="modal-overlay" id="modal-masuk" aria-hidden="true">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="masuk-judul">
    <div class="modal__header">
      <h2 id="masuk-judul" class="modal__judul">Login</h2>
      <button type="button" class="modal__tutup" aria-label="Tutup modal login" data-tutup="modal-masuk">
        ✕
      </button>
    </div>
    <p class="modal__subjudul-form">
      Login to your CRSL account to access your orders and benefits.
    </p>

    <form id="form-login" novalidate>
      <div class="modal__grup">
        <label for="masuk-identitas" class="modal__label">Your email/phone number</label>
        <div class="modal__input-ikon-wadah">
          <svg class="modal__input-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <input
            type="text"
            id="masuk-identitas"
            class="modal__input modal__input--berikon"
            placeholder="Your email or phone number"
            autocomplete="username"
            required
          >
        </div>
        <span class="modal__error-pesan" id="error-masuk-identitas"></span>
      </div>

      <button type="submit" id="tombol-submit-login" class="modal__tombol modal__tombol--primer">
        Next
      </button>

      <div class="modal__footer-switch">
        <span>Don't have account?</span>
        <button type="button" id="switch-ke-daftar" class="modal__link-switch">Signup here</button>
      </div>

      <p class="modal__disclaimer">
        This site is protected by reCAPTCHA and the Google
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        and
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
        apply.
      </p>
    </form>
  </div>
</div>

<!-- ========== MODAL REGISTER (Gambar 5) ========== -->
<div class="modal-overlay" id="modal-daftar" aria-hidden="true">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="daftar-judul">
    <div class="modal__header">
      <h2 id="daftar-judul" class="modal__judul">Register</h2>
      <button type="button" class="modal__tutup" aria-label="Tutup modal daftar" data-tutup="modal-daftar">
        ✕
      </button>
    </div>
    <p class="modal__subjudul-form">
      Create account to be our member to earn points, get free vouchers, and hear our news earlier.
    </p>

    <form id="form-register" novalidate>
      <!-- Full Name -->
      <div class="modal__grup">
        <input
          type="text"
          id="daftar-nama"
          class="modal__input"
          placeholder="Your Full Name*"
          autocomplete="name"
          required
        >
        <span class="modal__error-pesan" id="error-daftar-nama"></span>
      </div>

      <!-- Email -->
      <div class="modal__grup">
        <div class="modal__input-ikon-wadah">
          <svg class="modal__input-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <input
            type="email"
            id="daftar-email"
            class="modal__input modal__input--berikon"
            placeholder="Your email"
            autocomplete="email"
            required
          >
        </div>
        <span class="modal__error-pesan" id="error-daftar-email"></span>
      </div>

      <!-- Password -->
      <div class="modal__grup">
        <div class="modal__input-ikon-wadah">
          <svg class="modal__input-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            type="password"
            id="daftar-sandi"
            class="modal__input modal__input--berikon"
            placeholder="Password"
            autocomplete="new-password"
            required
          >
        </div>
        <span class="modal__error-pesan" id="error-daftar-sandi"></span>
      </div>

      <!-- My Birthday (3 Dropdown: Day, Month, Year) -->
      <div class="modal__grup">
        <label class="modal__label">My Birthday</label>
        <div class="modal__trio-select">
          <!-- Day -->
          <div class="modal__select-wadah">
            <select id="daftar-hari" class="modal__select" aria-label="Tanggal lahir">
              <option value="">Day</option>
              <?php for ($d = 1; $d <= 31; $d++): ?>
                <option value="<?= $d ?>"><?= $d ?></option>
              <?php endfor; ?>
            </select>
          </div>

          <!-- Month -->
          <div class="modal__select-wadah">
            <select id="daftar-bulan" class="modal__select" aria-label="Bulan lahir">
              <option value="">Month</option>
              <?php
              $bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              foreach ($bulan as $idx => $namaBulan): ?>
                <option value="<?= $idx + 1 ?>"><?= $namaBulan ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <!-- Year -->
          <div class="modal__select-wadah">
            <select id="daftar-tahun" class="modal__select" aria-label="Tahun lahir">
              <option value="">Year</option>
              <?php for ($y = 2026; $y >= 1950; $y--): ?>
                <option value="<?= $y ?>"><?= $y ?></option>
              <?php endfor; ?>
            </select>
          </div>
        </div>
        <span class="modal__error-pesan" id="error-daftar-ultah"></span>
      </div>

      <button type="submit" id="tombol-submit-daftar" class="modal__tombol modal__tombol--primer">
        Create New Account
      </button>

      <div class="modal__footer-switch">
        <span>Already have account?</span>
        <button type="button" id="switch-ke-masuk" class="modal__link-switch">Login here</button>
      </div>
    </form>
  </div>
</div>

<!-- ========== MODAL VERIFY ACCOUNTS (Poin 5) ========== -->
<div class="modal-overlay" id="modal-verifikasi" aria-hidden="true">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="verifikasi-judul">
    <div class="modal__header">
      <h2 id="verifikasi-judul" class="modal__judul">Verify Accounts</h2>
      <button type="button" id="tombol-tutup-verifikasi" class="modal__tutup" aria-label="Kembali ke formulir register">
        ✕
      </button>
    </div>

    <!-- Ilustrasi Vektor Relevan -->
    <div class="modal__ilustrasi-wadah">
      <svg class="modal__ilustrasi-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="60" cy="60" r="50" fill="#FFF1F2"/>
        <rect x="35" y="42" width="50" height="36" rx="6" fill="#E52027"/>
        <path d="M35 48L60 64L85 48" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="60" cy="60" r="14" fill="#FFFFFF" opacity="0.9"/>
        <path d="M55 60L59 64L66 56" stroke="#E52027" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p class="modal__subjudul-form" style="margin-top: 8px;">
        We have sent a 6-digit verification code to <strong id="verifikasi-target-email">your email</strong>.
      </p>
    </div>

    <form id="form-verifikasi" novalidate>
      <div class="modal__grup">
        <label for="verifikasi-kode" class="modal__label">Verification code</label>
        <div class="modal__input-ikon-wadah">
          <svg class="modal__input-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <input
            type="text"
            id="verifikasi-kode"
            class="modal__input modal__input--berikon modal__input--kode"
            placeholder="Enter 6 digits (e.g. 123456)"
            maxlength="6"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="one-time-code"
            required
          >
        </div>
        <span class="modal__error-pesan" id="error-verifikasi-kode"></span>
      </div>

      <!-- Resend Code Timer -->
      <div class="modal__resend-wadah">
        <span id="teks-timer-resend" class="modal__resend-teks">Resend code in (00:59)</span>
        <button type="button" id="tombol-resend-kode" class="modal__tombol-resend" style="display: none;">
          Resend code
        </button>
      </div>

      <!-- Tombol Konfirmasi Dinamis (Disabled sebelum 6 digit valid) -->
      <button type="submit" id="tombol-submit-verifikasi" class="modal__tombol modal__tombol--primer" disabled>
        Confirm &amp; Verify
      </button>
    </form>
  </div>
</div>
