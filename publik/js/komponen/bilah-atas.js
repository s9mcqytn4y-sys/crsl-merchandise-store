/**
 * Bilah Atas - Running Text / Announcement Bar
 * Mengisi teks pesan promo yang bergulir
 */

const BilahAtas = (() => {
  function init() {
    const jalur = document.querySelector('.bilah-atas__jalur');
    if (!jalur) return;

    const pesan = I18n.t('bilah_atas.pesan');
    if (!Array.isArray(pesan)) return;

    // Kosongkan konten yang ada
    jalur.innerHTML = '';

    // Buat 2 set pesan untuk loop seamless
    for (let i = 0; i < 2; i++) {
      pesan.forEach((teks) => {
        const span = document.createElement('span');
        span.className = 'bilah-atas__pesan';
        span.textContent = teks;
        jalur.appendChild(span);
      });
    }
  }

  return { init };
})();
