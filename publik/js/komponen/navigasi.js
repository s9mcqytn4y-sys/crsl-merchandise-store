/**
 * Navigasi - Header Navigation Controller
 * Dark mode toggle, sticky behavior
 */

const Navigasi = (() => {
  const TEMA_KEY = 'crsl_tema';

  function toggleTema() {
    const html = document.documentElement;
    const temaSaatIni = html.getAttribute('data-tema');
    const temaBaru = temaSaatIni === 'gelap' ? 'terang' : 'gelap';

    html.setAttribute('data-tema', temaBaru);
    localStorage.setItem(TEMA_KEY, temaBaru);

    // Update toggle button aria
    const toggle = document.getElementById('tombol-tema');
    if (toggle) {
      toggle.setAttribute('aria-label', temaBaru === 'gelap' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
    }
  }

  function muatTema() {
    const tersimpan = localStorage.getItem(TEMA_KEY);
    if (tersimpan) {
      document.documentElement.setAttribute('data-tema', tersimpan);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-tema', 'gelap');
    }
  }

  function init() {
    muatTema();

    const tombolTema = document.getElementById('tombol-tema');
    tombolTema?.addEventListener('click', toggleTema);
  }

  return { init, toggleTema };
})();
