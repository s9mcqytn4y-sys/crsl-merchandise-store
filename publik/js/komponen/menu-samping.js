/**
 * Menu Samping - Sidebar Drawer
 * Buka/tutup, overlay, focus trap, keyboard (Escape)
 */

const MenuSamping = (() => {
  let drawer = null;
  let overlay = null;
  let tombolBuka = null;
  let tombolTutup = null;
  let elemenFokus = [];
  let elemenTerakhirFokus = null;

  function buka() {
    if (!drawer || !overlay) return;
    elemenTerakhirFokus = document.activeElement;
    drawer.classList.add('aktif');
    overlay.classList.add('aktif');
    document.body.classList.add('tidak-gulir');
    drawer.setAttribute('aria-hidden', 'false');
    tombolBuka?.setAttribute('aria-expanded', 'true');

    // Focus first focusable element in drawer
    requestAnimationFrame(() => {
      const pertama = drawer.querySelector('button, a, input');
      pertama?.focus();
    });
  }

  function tutup() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('aktif');
    overlay.classList.remove('aktif');
    document.body.classList.remove('tidak-gulir');
    drawer.setAttribute('aria-hidden', 'true');
    tombolBuka?.setAttribute('aria-expanded', 'false');

    // Return focus
    elemenTerakhirFokus?.focus();
  }

  function tanganiKeydown(e) {
    if (e.key === 'Escape') {
      tutup();
      return;
    }

    // Focus trap
    if (e.key === 'Tab') {
      elemenFokus = Array.from(
        drawer.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      );
      if (elemenFokus.length === 0) return;

      const pertama = elemenFokus[0];
      const terakhir = elemenFokus[elemenFokus.length - 1];

      if (e.shiftKey && document.activeElement === pertama) {
        e.preventDefault();
        terakhir.focus();
      } else if (!e.shiftKey && document.activeElement === terakhir) {
        e.preventDefault();
        pertama.focus();
      }
    }
  }

  function init() {
    drawer = document.getElementById('menu-samping');
    overlay = document.getElementById('menu-samping-overlay');
    tombolBuka = document.getElementById('tombol-menu');
    tombolTutup = document.getElementById('tombol-tutup-menu');

    if (!drawer) return;

    tombolBuka?.addEventListener('click', buka);
    tombolTutup?.addEventListener('click', tutup);
    overlay?.addEventListener('click', tutup);

    // Search button inside drawer
    const tombolCariDrawer = document.getElementById('tombol-cari-drawer');
    tombolCariDrawer?.addEventListener('click', () => {
      tutup();
      // Trigger search open after drawer closes
      setTimeout(() => Pencarian.buka(), 350);
    });

    // Auto-close on anchor link click
    drawer.querySelectorAll('a[href*="#"]').forEach(link => {
      link.addEventListener('click', () => {
        tutup();
      });
    });

    drawer.addEventListener('keydown', tanganiKeydown);
  }

  return { init, buka, tutup };
})();
