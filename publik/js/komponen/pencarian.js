/**
 * Pencarian - Search Overlay Controller
 * Mengelola riwayat pencarian (Recent Search), istilah populer,
 * dan kartu produk recent viewed dengan tombol Add to Cart
 */

const Pencarian = (() => {
  const STORAGE_KEY = 'crsl_riwayat_cari';
  const POPULAR_TERMS = ['slingbag', 'helm', 'monie', 'mosko', 'topi', 'yori', 'ruby', 'wallet'];

  let overlay = null;
  let dialog = null;
  let input = null;
  let riwayatWadah = null;
  let riwayatList = null;
  let populerList = null;

  function ambilRiwayat() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function simpanRiwayat(kataKunci) {
    if (!kataKunci || !kataKunci.trim()) return;
    const kata = kataKunci.trim().toLowerCase();
    let riwayat = ambilRiwayat().filter(item => item.toLowerCase() !== kata);
    riwayat.unshift(kata);
    if (riwayat.length > 8) riwayat = riwayat.slice(0, 8);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(riwayat));
    renderRiwayat();
  }

  function hapusSatuRiwayat(kataKunci) {
    let riwayat = ambilRiwayat().filter(item => item.toLowerCase() !== kataKunci.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(riwayat));
    renderRiwayat();
  }

  function hapusSemuaRiwayat() {
    localStorage.removeItem(STORAGE_KEY);
    renderRiwayat();
  }

  function renderRiwayat() {
    if (!riwayatWadah || !riwayatList) return;
    const riwayat = ambilRiwayat();

    if (riwayat.length === 0) {
      riwayatWadah.classList.add('tersembunyi');
      riwayatList.innerHTML = '';
      return;
    }

    riwayatWadah.classList.remove('tersembunyi');
    riwayatList.innerHTML = '';

    riwayat.forEach(item => {
      const kapsul = document.createElement('div');
      kapsul.className = 'pencarian__kapsul';
      kapsul.innerHTML = `
        <span class="pencarian__kapsul-teks">${item}</span>
        <button type="button" class="pencarian__kapsul-hapus" aria-label="Hapus ${item}">✕</button>
      `;

      kapsul.querySelector('.pencarian__kapsul-teks').addEventListener('click', () => {
        if (input) input.value = item;
        simpanRiwayat(item);
      });

      kapsul.querySelector('.pencarian__kapsul-hapus').addEventListener('click', (e) => {
        e.stopPropagation();
        hapusSatuRiwayat(item);
      });

      riwayatList.appendChild(kapsul);
    });
  }

  function renderPopuler() {
    if (!populerList) return;
    populerList.innerHTML = '';

    POPULAR_TERMS.forEach(term => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pencarian__kapsul';
      btn.textContent = term;
      btn.addEventListener('click', () => {
        if (input) input.value = term;
        simpanRiwayat(term);
      });
      populerList.appendChild(btn);
    });
  }

  function buka() {
    if (!dialog || !overlay) return;
    renderRiwayat();
    dialog.classList.add('aktif');
    overlay.classList.add('aktif');
    requestAnimationFrame(() => {
      input?.focus();
    });
  }

  function tutup() {
    if (!dialog || !overlay) return;
    dialog.classList.remove('aktif');
    overlay.classList.remove('aktif');
  }

  function init() {
    dialog = document.getElementById('pencarian');
    overlay = document.getElementById('pencarian-overlay');
    input = document.getElementById('pencarian-input');
    riwayatWadah = document.getElementById('pencarian-riwayat');
    riwayatList = document.getElementById('pencarian-riwayat-list');
    populerList = document.getElementById('pencarian-populer-list');

    // Tombol buka di header & drawer
    document.getElementById('tombol-cari')?.addEventListener('click', buka);
    document.getElementById('tombol-cari-drawer')?.addEventListener('click', () => {
      if (typeof MenuSamping !== 'undefined' && MenuSamping.tutup) {
        MenuSamping.tutup();
      }
      setTimeout(buka, 250);
    });

    // Tombol tutup
    document.getElementById('tombol-tutup-pencarian')?.addEventListener('click', tutup);
    overlay?.addEventListener('click', tutup);

    // Form submit / input enter
    const tombolKirim = document.getElementById('pencarian-kirim');
    const prosesCari = () => {
      if (input && input.value.trim()) {
        simpanRiwayat(input.value.trim());
      }
    };

    tombolKirim?.addEventListener('click', prosesCari);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        prosesCari();
      }
    });

    // Tombol hapus semua riwayat
    document.getElementById('tombol-hapus-semua-riwayat')?.addEventListener('click', hapusSemuaRiwayat);

    // Tombol cart cepat pada kartu Recent Viewed (Cassie Wallet)
    document.getElementById('tombol-keranjang-cassie')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof Keranjang !== 'undefined' && Keranjang.bukaAddCart) {
        Keranjang.bukaAddCart({
          id: 'cassie-wallet',
          nama: 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid | Compact & Stylish',
          harga: 179100,
          hargaCoret: 199000,
          gambar: '/aset/gambar/cassie-wallet.webp',
          varianPilihan: ['CHILO PINK', 'CHOCO BROWN']
        });
      }
    });

    // Escape listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dialog?.classList.contains('aktif')) {
        tutup();
      }
    });

    renderPopuler();
    renderRiwayat();
  }

  return {
    init,
    buka,
    tutup,
  };
})();
