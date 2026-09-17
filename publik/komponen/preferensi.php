<?php
/**
 * Komponen Preferensi Lokalisasi & Mata Uang
 * Label rapi tanpa prefix kode kurung siku
 */
?>
<!-- ========== PREFERENSI (Localization Modal) ========== -->
<div id="preferensi-overlay" class="preferensi__overlay" aria-hidden="true"></div>
<div
  id="preferensi"
  class="preferensi"
  role="dialog"
  aria-modal="true"
  aria-label="Pengaturan lokalisasi"
>
  <!-- Deliver to -->
  <div class="preferensi__grup">
    <label for="select-negara" class="preferensi__label">Kirim ke</label>
    <div class="preferensi__select-wadah">
      <select id="select-negara" class="preferensi__select">
        <option value="ID">🇮🇩 Indonesia</option>
        <option value="MY">🇲🇾 Malaysia</option>
        <option value="SG">🇸🇬 Singapore</option>
      </select>
    </div>
  </div>

  <!-- Language -->
  <div class="preferensi__grup">
    <label for="select-bahasa" class="preferensi__label">Bahasa</label>
    <select id="select-bahasa" class="preferensi__select">
      <option value="en">English</option>
      <option value="id" selected>Bahasa Indonesia</option>
    </select>
  </div>

  <!-- Currency -->
  <div class="preferensi__grup">
    <label for="select-mata-uang" class="preferensi__label">Mata Uang</label>
    <select id="select-mata-uang" class="preferensi__select">
      <option value="IDR">IDR - Rupiah Indonesia</option>
      <option value="USD">USD - United States Dollar</option>
      <option value="SGD">SGD - Singapore Dollar</option>
      <option value="MYR">MYR - Malaysian Ringgit</option>
      <option value="THB">THB - Thai Baht</option>
      <option value="EUR">EUR - Euro</option>
    </select>
  </div>

  <!-- Save button -->
  <button type="button" id="tombol-simpan-preferensi" class="preferensi__simpan">Simpan</button>
</div>
