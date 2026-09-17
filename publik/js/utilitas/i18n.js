/**
 * i18n - Internationalization Module
 * Memuat terjemahan dari file JSON dan menyediakan fungsi t() untuk translate
 */

const I18n = (() => {
  let terjemahan = {};
  let bahasaSaatIni = 'id';

  /**
   * Ambil nilai nested dari objek menggunakan dot notation
   * @param {Object} obj
   * @param {string} kunci - contoh: "navigasi.cari"
   * @returns {*}
   */
  function ambilNested(obj, kunci) {
    return kunci.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : kunci), obj);
  }

  /**
   * Muat file terjemahan
   * @param {string} bahasa - kode bahasa ('id' atau 'en')
   */
  async function muat(bahasa) {
    try {
      const respon = await fetch(`/src/terjemahan/${bahasa}.json`);
      if (!respon.ok) throw new Error(`HTTP ${respon.status}`);
      terjemahan = await respon.json();
      bahasaSaatIni = bahasa;
      localStorage.setItem('crsl_bahasa', bahasa);
      document.documentElement.lang = bahasa;
    } catch (err) {
      console.warn(`Gagal memuat terjemahan ${bahasa}:`, err);
    }
  }

  /**
   * Terjemahkan kunci
   * @param {string} kunci - dot notation key, contoh: "navigasi.cari"
   * @returns {*} - string atau array atau objek terjemahan
   */
  function t(kunci) {
    return ambilNested(terjemahan, kunci);
  }

  /**
   * Dapatkan bahasa saat ini
   * @returns {string}
   */
  function bahasaAktif() {
    return bahasaSaatIni;
  }

  /**
   * Inisialisasi: muat bahasa dari localStorage atau default
   */
  async function init() {
    const tersimpan = localStorage.getItem('crsl_bahasa');
    await muat(tersimpan || 'id');
  }

  return { init, muat, t, bahasaAktif };
})();
