/**
 * Pencarian - Search Overlay & Live Search Engine Controller
 * Mengelola riwayat pencarian (Recent Search), istilah populer,
 * kartu produk recent viewed, dan live search engine real-time
 */

const Pencarian = (() => {
  const STORAGE_KEY = 'crsl_riwayat_cari';
  const POPULAR_TERMS = ['slingbag', 'helm', 'monie', 'mosko', 'topi', 'yori', 'ruby', 'wallet', 'tumblr', 'backpack'];

  // Katalog produk untuk live search engine
  const KATALOG_PRODUK = [
    {
      id: 'crsl-drinke-tumblr',
      nama: 'CRSL Drinke Tumblr Series | Botol Tempat minum | Tumbler 900ml',
      kategori: 'Tumbler Collection',
      kataKunci: 'tumblr tumblr drinke botol stainless minum pre-order',
      harga: 289000,
      hargaCoret: 289000,
      gambar: '/aset/gambar/drinke-tumblr.webp',
      varianPilihan: ['CHILO PINK', 'POPO BLUE', 'ODIN YELLOW', 'CHOCO GREY', 'PIGKO PEACH']
    },
    {
      id: 'cassie-wallet',
      nama: 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid',
      kategori: 'Wallet & Accessories',
      kataKunci: 'wallet dompet lipat canvas cassie chilo choco accessories',
      harga: 179100,
      hargaCoret: 199000,
      gambar: '/aset/gambar/cassie-wallet.webp',
      varianPilihan: ['CHILO PINK', 'CHOCO BROWN']
    },
    {
      id: 'odin-backpack',
      nama: 'CRSL Odin Fluffy Backpack | Tas Ransel Sekolah Dinosaurus Hijau',
      kategori: 'Backpacks',
      kataKunci: 'backpack tas ransel sekolah dinosaurus odin green hijau',
      harga: 296100,
      hargaCoret: 329000,
      gambar: '/aset/gambar/banner-bts.webp',
      varianPilihan: ['ODIN GREEN', 'POPO NAVY']
    },
    {
      id: 'chilo-slingbag',
      nama: 'CRSL Chilo Canvas Slingbag | Tas Selempang Lucu Kucing Pink',
      kategori: 'Slingbags',
      kataKunci: 'slingbag tas selempang chilo kucing pink canvas',
      harga: 197100,
      hargaCoret: 219000,
      gambar: '/aset/gambar/cassie-wallet.webp',
      varianPilihan: ['CHILO PINK', 'CHOCO BROWN']
    },
    {
      id: 'popo-tumbler',
      nama: 'CRSL Popo Vacuum Tumbler 500ml | Stainless Steel Panda',
      kategori: 'Tumbler Collection',
      kataKunci: 'tumbler popo panda botol stainless vacuum 500ml',
      harga: 170100,
      hargaCoret: 189000,
      gambar: '/aset/gambar/drinke-tumblr.webp',
      varianPilihan: ['POPO BLUE', 'CHILO PINK']
    },
    {
      id: 'choco-hoodie',
      nama: 'CRSL Choco Oversized Hoodie | Jaket Hangat Beruang Cokelat',
      kategori: 'Outerwears',
      kataKunci: 'hoodie jaket outerwear choco beruang cokelat hangat pakaian',
      harga: 323100,
      hargaCoret: 359000,
      gambar: '/aset/gambar/banner-1.webp',
      varianPilihan: ['M', 'L', 'XL']
    },
    {
      id: 'pigko-cap',
      nama: 'CRSL Pigko Cheerful Cap | Topi Baseball Karakter Peach Pig',
      kategori: 'Headwears',
      kataKunci: 'topi cap headwear pigko babi peach baseball',
      harga: 116100,
      hargaCoret: 129000,
      gambar: '/aset/gambar/banner-2.webp',
      varianPilihan: ['ALL SIZE']
    }
  ];

  let overlay = null;
  let dialog = null;
  let input = null;
  let riwayatWadah = null;
  let riwayatList = null;
  let populerWadah = null;
  let populerList = null;
  let dilihatWadah = null;
  let hasilWadah = null;
  let hasilGrid = null;
  let hasilJumlah = null;

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
        if (input) {
          input.value = item;
          lakukanPencarian(item);
        }
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
        if (input) {
          input.value = term;
          lakukanPencarian(term);
        }
        simpanRiwayat(term);
      });
      populerList.appendChild(btn);
    });
  }

  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function lakukanPencarian(query) {
    const q = (query || '').trim().toLowerCase();

    if (!q) {
      // Tampilkan kembali elemen default jika query kosong
      if (hasilWadah) hasilWadah.classList.add('tersembunyi');
      if (populerWadah) populerWadah.classList.remove('tersembunyi');
      if (dilihatWadah) dilihatWadah.classList.remove('tersembunyi');
      renderRiwayat();
      return;
    }

    // Sembunyikan default, tampilkan live search results
    if (populerWadah) populerWadah.classList.add('tersembunyi');
    if (dilihatWadah) dilihatWadah.classList.add('tersembunyi');
    if (hasilWadah) hasilWadah.classList.remove('tersembunyi');

    const hasil = KATALOG_PRODUK.filter(p => {
      return p.nama.toLowerCase().includes(q) ||
             p.kategori.toLowerCase().includes(q) ||
             p.kataKunci.toLowerCase().includes(q);
    });

    if (hasilJumlah) {
      hasilJumlah.textContent = `(${hasil.length} item ditemukan)`;
    }

    if (!hasilGrid) return;
    hasilGrid.innerHTML = '';

    if (hasil.length === 0) {
      hasilGrid.innerHTML = `
        <div class="pencarian__hasil-kosong" style="grid-column: 1 / -1;">
          <p>Tidak ada produk yang cocok dengan "<strong>${q}</strong>".</p>
          <p style="margin-top: 4px; font-size: 12px;">Coba gunakan kata kunci lain seperti <em>slingbag, wallet, atau tumbler</em>.</p>
        </div>
      `;
      return;
    }

    hasil.forEach(prod => {
      const kartu = document.createElement('div');
      kartu.className = 'pencarian__kartu-produk';
      kartu.innerHTML = `
        <div class="pencarian__gambar-wadah">
          <img src="${prod.gambar}" alt="${prod.nama}" class="pencarian__gambar" loading="lazy">
          <button type="button" class="pencarian__tombol-keranjang-cepat" aria-label="Tambah ${prod.nama} ke keranjang" title="Add to Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </button>
        </div>
        <p class="pencarian__nama-produk" title="${prod.nama}">${prod.nama}</p>
        ${prod.hargaCoret && prod.hargaCoret > prod.harga ? `<p class="pencarian__harga-coret">${formatRupiah(prod.hargaCoret)}</p>` : ''}
        <p class="pencarian__harga-aktif">${formatRupiah(prod.harga)}</p>
      `;

      kartu.querySelector('.pencarian__tombol-keranjang-cepat')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof Keranjang !== 'undefined' && Keranjang.bukaAddCart) {
          Keranjang.bukaAddCart({
            id: prod.id,
            nama: prod.nama,
            harga: prod.harga,
            hargaCoret: prod.hargaCoret,
            gambar: prod.gambar,
            varianPilihan: prod.varianPilihan
          });
        }
      });

      hasilGrid.appendChild(kartu);
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
    populerWadah = document.querySelector('.pencarian__populer');
    populerList = document.getElementById('pencarian-populer-list');
    dilihatWadah = document.querySelector('.pencarian__dilihat');
    hasilWadah = document.getElementById('pencarian-hasil');
    hasilGrid = document.getElementById('pencarian-hasil-grid');
    hasilJumlah = document.getElementById('pencarian-hasil-jumlah');

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

    // Live search saat mengetik
    input?.addEventListener('input', () => {
      lakukanPencarian(input.value);
    });

    // Form submit / input enter
    const tombolKirim = document.getElementById('pencarian-kirim');
    const prosesCari = () => {
      if (input && input.value.trim()) {
        simpanRiwayat(input.value.trim());
        lakukanPencarian(input.value.trim());
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
    lakukanPencarian,
  };
})();
