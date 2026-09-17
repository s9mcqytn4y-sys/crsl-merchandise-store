/**
 * Aplikasi - Main Entry Point
 * Inisialisasi semua komponen setelah DOM ready
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load translations first
  await I18n.init();

  // 2. Initialize components that depend on i18n
  BilahAtas.init();

  // 3. Initialize interactive components
  Navigasi.init();
  MenuSamping.init();
  Pencarian.init();
  Preferensi.init();
});
