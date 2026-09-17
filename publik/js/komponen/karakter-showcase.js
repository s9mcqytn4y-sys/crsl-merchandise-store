/**
 * Karakter Showcase - Vanilla JS
 * Interaktivitas tab 5 karakter CRSL
 */

const KarakterShowcase = {
  tabs: [],
  panels: [],

  init() {
    this.tabs = Array.from(document.querySelectorAll('.karakter__tab'));
    this.panels = Array.from(document.querySelectorAll('.karakter__panel'));

    if (this.tabs.length === 0) return;

    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        const id = tab.dataset.karakter;
        this.pilih(id);
      });

      // Keyboard navigation antar tabs
      tab.addEventListener('keydown', (e) => {
        let targetIndex = index;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % this.tabs.length;
          this.tabs[targetIndex].focus();
          this.pilih(this.tabs[targetIndex].dataset.karakter);
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + this.tabs.length) % this.tabs.length;
          this.tabs[targetIndex].focus();
          this.pilih(this.tabs[targetIndex].dataset.karakter);
        }
      });
    });
  },

  pilih(id) {
    // Perbarui status tabs
    this.tabs.forEach((tab) => {
      const match = tab.dataset.karakter === id;
      tab.classList.toggle('aktif', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    // Perbarui status panel
    this.panels.forEach((panel) => {
      const match = panel.id === `panel-${id}`;
      panel.classList.toggle('aktif', match);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  KarakterShowcase.init();
});
