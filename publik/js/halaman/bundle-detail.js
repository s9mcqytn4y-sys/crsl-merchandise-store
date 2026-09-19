/**
 * CRSL Merchandise Store - Bundle Detail Controller
 * Standar /antislop-ui, /antislop-code, /baseline-ui, & /007
 * - Logika pemilihan varian per item, validasi 1 set lengkap
 * - Delivery estimator popover & JNE options
 * - Modal Message CRSL (Screenshot 5)
 * - Carousel navigation You Might Also Like
 * - Integrasi mulus dengan Keranjang Belanja & Drawer Cart
 */

document.addEventListener('DOMContentLoaded', () => {
  const gambarUtama = document.getElementById('bundle-gambar-utama');
  const thumbBtns = document.querySelectorAll('.bundle-pdp__thumb-btn');
  const itemsContainer = document.getElementById('bundle-items-list');
  const ctaBtn = document.getElementById('bundle-cta-btn');
  const mobileBtnBuy = document.getElementById('bundle-mobile-btn-buy');
  const toast = document.getElementById('bundle-toast');

  function tampilkanToast(pesan) {
    if (!toast) {
      alert(pesan);
      return;
    }
    toast.textContent = pesan;
    toast.classList.add('aktif');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('aktif');
    }, 2800);
  }

  if (!itemsContainer) return;

  const bundleNama = itemsContainer.getAttribute('data-bundle-nama') || 'BACK TO SCHOOL with Miflo';
  const bundleHarga = parseInt(itemsContainer.getAttribute('data-bundle-harga'), 10) || 289000;
  const bundleGambar = itemsContainer.getAttribute('data-bundle-gambar') || '/aset/gambar/bundle-miflo-cover.webp';

  // 1. Galeri Thumbnail Switcher
  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      thumbBtns.forEach(b => {
        b.classList.remove('aktif');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('aktif');
      btn.setAttribute('aria-selected', 'true');
      const url = btn.getAttribute('data-url');
      if (gambarUtama && url) {
        gambarUtama.style.opacity = '0.4';
        setTimeout(() => {
          gambarUtama.src = url;
          gambarUtama.style.opacity = '1';
        }, 150);
      }
    });
  });

  // 2. State Pilihan Varian Item
  const itemCards = itemsContainer.querySelectorAll('.bundle-item-kartu');
  const pilihanVarian = {};

  itemCards.forEach((kartu, idx) => {
    const defaultPill = kartu.querySelector('.bundle-item-kartu__varian-pill.aktif') || kartu.querySelector('.bundle-item-kartu__varian-pill');
    pilihanVarian[idx] = {
      nama: kartu.getAttribute('data-item-nama'),
      varian: defaultPill ? defaultPill.getAttribute('data-varian') : 'Default'
    };

    const pills = kartu.querySelectorAll('.bundle-item-kartu__varian-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.classList.remove('aktif');
          p.setAttribute('aria-checked', 'false');
        });
        pill.classList.add('aktif');
        pill.setAttribute('aria-checked', 'true');
        pilihanVarian[idx].varian = pill.getAttribute('data-varian');
      });
    });
  });

  // 3. Delivery Popover
  const btnCekOngkir = document.getElementById('bundle-btn-cek-ongkir');
  const popoverKurir = document.getElementById('bundle-popover-kurir');
  const btnTutupKurir = document.getElementById('bundle-btn-tutup-kurir');

  btnCekOngkir?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popoverKurir) {
      popoverKurir.style.display = popoverKurir.style.display === 'none' ? 'block' : 'none';
    }
  });

  btnTutupKurir?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popoverKurir) popoverKurir.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    if (popoverKurir && !popoverKurir.contains(e.target) && e.target !== btnCekOngkir && !btnCekOngkir?.contains(e.target)) {
      popoverKurir.style.display = 'none';
    }
  });

  // 4. Modal Message CRSL (Screenshot 5)
  const btnPesan = document.getElementById('bundle-btn-pesan-crsl');
  const modalPesanOverlay = document.getElementById('bundle-modal-pesan-overlay');
  const btnClosePesan = document.getElementById('bundle-btn-close-pesan');
  const inputMsg = document.getElementById('bundle-pesan-crsl-input');
  const btnKirimPesan = document.getElementById('bundle-pesan-crsl-kirim');

  function bukaModalPesan() {
    if (!modalPesanOverlay) return;
    modalPesanOverlay.style.display = 'flex';
    void modalPesanOverlay.offsetWidth;
    modalPesanOverlay.classList.add('aktif');
    modalPesanOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (inputMsg) {
      inputMsg.focus();
      evaluasiInputPesan();
    }
  }

  function tutupModalPesan() {
    if (!modalPesanOverlay) return;
    modalPesanOverlay.classList.remove('aktif');
    modalPesanOverlay.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      modalPesanOverlay.style.display = 'none';
    }, 250);
    document.body.style.overflow = '';
  }

  function evaluasiInputPesan() {
    if (!inputMsg || !btnKirimPesan) return;
    const len = inputMsg.value.trim().length;
    if (len > 0) {
      btnKirimPesan.disabled = false;
      btnKirimPesan.classList.add('aktif');
    } else {
      btnKirimPesan.disabled = true;
      btnKirimPesan.classList.remove('aktif');
    }
  }

  inputMsg?.addEventListener('input', evaluasiInputPesan);
  btnPesan?.addEventListener('click', bukaModalPesan);
  btnClosePesan?.addEventListener('click', tutupModalPesan);

  modalPesanOverlay?.addEventListener('click', (e) => {
    if (e.target === modalPesanOverlay) tutupModalPesan();
  });

  btnKirimPesan?.addEventListener('click', async () => {
    const isi = inputMsg?.value.trim();
    if (!isi) return;

    btnKirimPesan.disabled = true;
    btnKirimPesan.textContent = 'Sending...';

    const payload = {
      id_produk: 3516,
      nama_produk: bundleNama,
      varian: 'Bundle Complete Set',
      pesan: isi
    };

    try {
      // Simpan lokal
      try {
        const riwayat = JSON.parse(localStorage.getItem('crsl_pesan_inquiry') || '[]');
        riwayat.push({ ...payload, tanggal: new Date().toISOString() });
        localStorage.setItem('crsl_pesan_inquiry', JSON.stringify(riwayat));
      } catch {}

      // Kirim endpoint
      await fetch('/api/pesan/kirim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      tampilkanToast('Pesan Anda berhasil dikirim ke CRSL!');
      if (inputMsg) inputMsg.value = '';
      evaluasiInputPesan();
      tutupModalPesan();
    } catch {
      tampilkanToast('Pesan tersimpan. Tim CRSL akan merespons segera.');
      tutupModalPesan();
    } finally {
      btnKirimPesan.textContent = 'Send';
      evaluasiInputPesan();
    }
  });

  // 5. Tombol CTA Tambah ke Keranjang
  function tambahBundleKeKeranjang() {
    const varianLabels = Object.values(pilihanVarian).map(v => `${v.nama}: ${v.varian}`).join(' | ');

    const itemBundle = {
      id: `bundle-${Date.now()}`,
      sku: 'CRSL-BUNDLE-BTS',
      nama: bundleNama,
      harga: bundleHarga,
      hargaCoret: bundleHarga + 54100,
      gambar: bundleGambar,
      varian: varianLabels || 'Bundle Complete Set',
      jumlah: 1,
      tipe: 'bundle',
      isBundle: true
    };

    const STORAGE_KEY = 'crsl_keranjang';
    let items = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) items = JSON.parse(raw);
    } catch {}

    items.push(itemBundle);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}

    if (typeof Keranjang !== 'undefined') {
      if (Keranjang.simpanItems) {
        Keranjang.simpanItems(items);
      }
      if (Keranjang.bukaCart) {
        Keranjang.bukaCart();
      }
    }
    tampilkanToast('Bundle berhasil dimasukkan ke keranjang!');
  }

  ctaBtn?.addEventListener('click', tambahBundleKeKeranjang);
  mobileBtnBuy?.addEventListener('click', tambahBundleKeKeranjang);

  // 6. Carousel Track Navigation
  const track = document.getElementById('bundle-rekomendasi-track');
  const prevBtn = document.getElementById('bundle-rekomendasi-prev');
  const nextBtn = document.getElementById('bundle-rekomendasi-next');

  prevBtn?.addEventListener('click', () => {
    track?.scrollBy({ left: -240, behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    track?.scrollBy({ left: 240, behavior: 'smooth' });
  });
});
