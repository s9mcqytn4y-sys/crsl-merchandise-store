/**
 * Bilah Atas - Rotator Teks Dinamis
 * Menampilkan 1 pesan promo pada satu waktu:
 * Masuk dari kiri, stay di tengah untuk dibaca, lalu meluncur ke kiri
 */

const BilahAtas = (() => {
  let intervalRotasi = null;
  let indeksAktif = 0;
  let daftarElemen = [];

  function init() {
    const wadah = document.querySelector('.bilah-atas__rotator') || document.querySelector('.bilah-atas');
    if (!wadah) return;

    const pesan = I18n.t('bilah_atas.pesan');
    if (!Array.isArray(pesan) || pesan.length === 0) return;

    // Bersihkan wadah
    wadah.innerHTML = '';
    daftarElemen = [];

    // Buat elemen untuk setiap pesan promo
    pesan.forEach((teks, i) => {
      const el = document.createElement('p');
      el.className = 'bilah-atas__pesan';
      el.textContent = teks;
      if (i === 0) {
        el.classList.add('aktif');
      }
      wadah.appendChild(el);
      daftarElemen.push(el);
    });

    if (daftarElemen.length <= 1) return;

    // Bersihkan interval sebelumnya jika ada
    if (intervalRotasi) {
      clearInterval(intervalRotasi);
    }

    indeksAktif = 0;

    // Loop rotasi setiap 4 detik
    intervalRotasi = setInterval(() => {
      const elSebelumnya = daftarElemen[indeksAktif];
      
      // Indeks berikutnya
      indeksAktif = (indeksAktif + 1) % daftarElemen.length;
      const elBerikutnya = daftarElemen[indeksAktif];

      // Animasi keluar ke kiri untuk pesan lama
      elSebelumnya.classList.remove('aktif');
      elSebelumnya.classList.add('keluar');

      // Siapkan pesan baru masuk dari kiri (atau smooth slide-in)
      elBerikutnya.classList.remove('keluar');
      elBerikutnya.classList.add('siap-masuk');

      // Trigger reflow agar transisi berjalan
      void elBerikutnya.offsetWidth;

      elBerikutnya.classList.remove('siap-masuk');
      elBerikutnya.classList.add('aktif');

      // Reset state elemen lama setelah animasi selesai
      setTimeout(() => {
        elSebelumnya.classList.remove('keluar');
      }, 500);
    }, 4000);
  }

  return { init };
})();
