/**
 * Preferensi - Localization Modal
 * Manage country, language, currency preferences
 * Persist to localStorage
 */

const Preferensi = (() => {
  let modal = null;
  let overlay = null;
  let selectNegara = null;
  let selectBahasa = null;
  let selectMataUang = null;

  const STORAGE_KEY = 'crsl_preferensi';

  function muatTersimpan() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { negara: 'ID', bahasa: 'id', mataUang: 'IDR' };
    } catch {
      return { negara: 'ID', bahasa: 'id', mataUang: 'IDR' };
    }
  }

  function simpan() {
    const preferensi = {
      negara: selectNegara?.value || 'ID',
      bahasa: selectBahasa?.value || 'id',
      mataUang: selectMataUang?.value || 'IDR',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferensi));

    // Update currency display in navbar
    const tampilan = document.getElementById('teks-mata-uang');
    if (tampilan) tampilan.textContent = preferensi.mataUang;

    // Update flag
    const bendera = document.getElementById('bendera-navigasi');
    if (bendera) {
      const benderaMap = { 'ID': 'bendera-id', 'MY': 'bendera-my', 'SG': 'bendera-sg', 'US': 'bendera-en', 'EN': 'bendera-en' };
      const namaFile = benderaMap[preferensi.negara] || (preferensi.bahasa === 'en' ? 'bendera-en' : 'bendera-id');
      bendera.src = `/aset/ikon/${namaFile}.svg`;
      bendera.alt = `Bendera ${preferensi.negara || 'Indonesia'}`;
    }

    // Switch language
    if (preferensi.bahasa !== I18n.bahasaAktif()) {
      I18n.muat(preferensi.bahasa).then(() => {
        BilahAtas.init();
      });
    }

    tutup();
  }

  function buka() {
    if (!modal || !overlay) return;
    const data = muatTersimpan();

    if (selectNegara) selectNegara.value = data.negara;
    if (selectBahasa) selectBahasa.value = data.bahasa;
    if (selectMataUang) selectMataUang.value = data.mataUang;

    modal.classList.add('aktif');
    overlay.classList.add('aktif');

    requestAnimationFrame(() => {
      selectNegara?.focus();
    });
  }

  function tutup() {
    if (!modal || !overlay) return;
    modal.classList.remove('aktif');
    overlay.classList.remove('aktif');
  }

  function init() {
    modal = document.getElementById('preferensi');
    overlay = document.getElementById('preferensi-overlay');
    selectNegara = document.getElementById('select-negara');
    selectBahasa = document.getElementById('select-bahasa');
    selectMataUang = document.getElementById('select-mata-uang');

    const tombolBuka = document.getElementById('tombol-preferensi');
    const tombolSimpan = document.getElementById('tombol-simpan-preferensi');

    tombolBuka?.addEventListener('click', buka);
    tombolSimpan?.addEventListener('click', simpan);
    overlay?.addEventListener('click', tutup);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('aktif')) {
        tutup();
      }
    });

    // Set initial display from saved preferences
    const data = muatTersimpan();
    const tampilan = document.getElementById('teks-mata-uang');
    if (tampilan) tampilan.textContent = data.mataUang;
  }

  return { init, buka, tutup };
})();
