/**
 * Pencarian - Search Overlay
 * Buka/tutup, focus input, popular tags, Escape key
 */

const Pencarian = (() => {
  let wadah = null;
  let overlay = null;
  let input = null;
  let tombolTutup = null;

  function buka() {
    if (!wadah || !overlay) return;
    wadah.classList.add('aktif');
    overlay.classList.add('aktif');
    document.body.classList.add('tidak-gulir');

    requestAnimationFrame(() => {
      input?.focus();
    });
  }

  function tutup() {
    if (!wadah || !overlay) return;
    wadah.classList.remove('aktif');
    overlay.classList.remove('aktif');
    document.body.classList.remove('tidak-gulir');
    if (input) input.value = '';
  }

  function tanganiKeydown(e) {
    if (e.key === 'Escape') tutup();
  }

  function isiTagPopuler() {
    const wadahTag = document.querySelector('.pencarian__tag-wadah');
    if (!wadahTag) return;

    const istilah = ['ruby', 'slingbag', 'monie', 'topi', 'tumbler', 'helm', 'wallet', 'mosko'];
    wadahTag.innerHTML = '';

    istilah.forEach((kata) => {
      const tag = document.createElement('button');
      tag.type = 'button';
      tag.className = 'pencarian__tag';
      tag.textContent = kata;
      tag.addEventListener('click', () => {
        if (input) {
          input.value = kata;
          input.focus();
        }
      });
      wadahTag.appendChild(tag);
    });
  }

  function init() {
    wadah = document.getElementById('pencarian');
    overlay = document.getElementById('pencarian-overlay');
    input = document.getElementById('pencarian-input');
    tombolTutup = document.getElementById('tombol-tutup-pencarian');

    if (!wadah) return;

    // Open triggers
    const tombolCariNav = document.getElementById('tombol-cari');
    tombolCariNav?.addEventListener('click', buka);

    tombolTutup?.addEventListener('click', tutup);
    overlay?.addEventListener('click', tutup);

    document.addEventListener('keydown', (e) => {
      if (wadah.classList.contains('aktif')) {
        tanganiKeydown(e);
      }
    });

    isiTagPopuler();
  }

  return { init, buka, tutup };
})();
