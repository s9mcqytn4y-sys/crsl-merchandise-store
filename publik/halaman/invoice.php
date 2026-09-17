<?php
/**
 * CRSL Merchandise Store - Halaman Invoice Digital / Bukti Pembelian
 * Sesuai Standar UU ITE & PP PSTE Republik Indonesia
 */

$nomorPesanan = $pesananId ?? ('CRSL-ORD-' . date('Ymd') . '-8821');
?>
<!DOCTYPE html>
<html lang="id" data-tema="terang">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Faktur Pembelian <?= htmlspecialchars($nomorPesanan) ?> - CRSL Official Store</title>
  <meta name="robots" content="noindex, nofollow">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/variabel.css">
  <link rel="stylesheet" href="/css/dasar.css">
  <link rel="stylesheet" href="/css/tata-letak.css">
  <link rel="stylesheet" href="/css/komponen/navigasi.css">
  <link rel="stylesheet" href="/css/halaman/invoice.css">
</head>
<body>
  <!-- Header Minimalis -->
  <header class="navigasi" role="banner" style="position: static;">
    <div class="navigasi__wadah">
      <div class="navigasi__kiri">
        <a href="/" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.9rem;">
          ← Kembali ke Beranda
        </a>
      </div>
      <div class="navigasi__tengah">
        <a href="/" class="navigasi__logo">
          <img src="/aset/gambar/logo-crsl.svg" alt="CRSL" width="90" height="26">
        </a>
      </div>
      <div class="navigasi__kanan">
        <a href="/akun" style="font-weight: 600; font-size: 0.9rem; color: var(--warna-primer);">
          Akun Saya
        </a>
      </div>
    </div>
  </header>

  <main class="invoice-page">
    <div class="invoice-container">
      <div class="invoice-card" id="invoice-card-element">
        <!-- Header Invoice -->
        <div class="invoice-header">
          <div class="invoice-header__brand">
            <img src="/aset/gambar/logo-crsl.svg" alt="CRSL Official Store" width="120" height="34">
            <p style="font-size: 0.8rem; color: var(--warna-teks-redup); margin-top: 0.25rem;">
              PT Kreasi Hewan Sahabat (CRSL Official)<br>
              NPWP: 03.882.912.4-542.000<br>
              Jl. Seturan Raya, Caturtunggal, Depok, Sleman, DI Yogyakarta 55281
            </p>
          </div>
          <div class="invoice-header__title-box">
            <h1 class="invoice-title">FAKTUR PENJUALAN</h1>
            <div class="invoice-nomor" id="inv-nomor"><?= htmlspecialchars($nomorPesanan) ?></div>
            <div style="font-size: 0.85rem; color: var(--warna-teks-redup); margin-top: 0.2rem;" id="inv-tanggal">
              Tanggal: <?= date('d F Y') ?>
            </div>
            <span class="invoice-badge-status invoice-badge-status--lunas" id="inv-status">LUNAS / BERHASIL DIBUAT</span>
          </div>
        </div>

        <!-- Info Pihak Terlibat -->
        <div class="invoice-parties">
          <div class="invoice-parties__box">
            <h4>Tujuan Pengiriman:</h4>
            <div style="font-weight: 700;" id="inv-nama-penerima">Rina Anggraini</div>
            <div id="inv-telepon">WhatsApp: 081234567890</div>
            <div id="inv-alamat" style="color: var(--warna-teks-redup); margin-top: 0.25rem;">
              Jl. Seturan Raya No. 88, Caturtunggal, Depok, Sleman, DI Yogyakarta 55281
            </div>
          </div>
          <div class="invoice-parties__box">
            <h4>Metode Pengiriman &amp; Pembayaran:</h4>
            <div>Kurir: <strong id="inv-kurir">JNE Reguler (Estimasi 2-3 Hari)</strong></div>
            <div>Metode: <strong id="inv-metode">QRIS Dinamis Standar Nasional</strong></div>
            <div>Status Transaksi: <strong style="color: #10b981;">Terkonfirmasi Otomatis</strong></div>
          </div>
        </div>

        <!-- Tabel Rincian Pesanan -->
        <table class="invoice-table" aria-label="Tabel rincian pembelian">
          <thead>
            <tr>
              <th>No</th>
              <th>Deskripsi Produk</th>
              <th>Harga</th>
              <th style="text-align: center;">Jumlah</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody id="inv-tabel-body">
            <tr>
              <td>1</td>
              <td>
                <strong>CRSL Cassie Wallet | Dompet Lipat Canvas Wanita</strong><br>
                <span style="font-size: 0.75rem; color: var(--warna-teks-redup);">Varian: CHILO PINK</span>
              </td>
              <td>Rp 179.100</td>
              <td style="text-align: center;">1</td>
              <td>Rp 179.100</td>
            </tr>
          </tbody>
        </table>

        <!-- Ringkasan Kalkulasi -->
        <div class="invoice-summary">
          <div class="invoice-summary__table">
            <div class="invoice-summary__row">
              <span>Subtotal Produk</span>
              <span id="inv-subtotal">Rp 179.100</span>
            </div>
            <div class="invoice-summary__row">
              <span>Ongkos Kirim</span>
              <span id="inv-ongkir">Rp 18.000</span>
            </div>
            <div class="invoice-summary__row">
              <span>Asuransi &amp; Biaya Layanan</span>
              <span id="inv-layanan">Rp 3.000</span>
            </div>
            <div class="invoice-summary__row invoice-summary__row--total">
              <span>Total Pembayaran</span>
              <span id="inv-total">Rp 200.100</span>
            </div>
          </div>
        </div>

        <p style="font-size: 0.75rem; color: var(--warna-teks-redup); text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 1rem;">
          Faktur ini sah dan diproses secara otomatis oleh sistem komputer CRSL Store sesuai dengan ketentuan UU ITE &amp; PP No. 71 Tahun 2019. Simpan bukti faktur ini untuk klaim garansi produk resmi 30 hari.
        </p>

        <!-- Tombol Aksi -->
        <div class="invoice-actions">
          <button type="button" class="btn-invoice-cetak" onclick="window.print()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>Cetak / Simpan PDF</span>
          </button>
          <a href="/akun" class="btn-invoice-beranda">
            <span>Lihat Pesanan di Akun</span> →
          </a>
        </div>
      </div>
    </div>
  </main>

  <script>
  // Sinkronisasi data invoice dengan data pesanan lokal terakhir
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const orders = JSON.parse(localStorage.getItem('crsl_orders') || '[]');
      if (orders && orders.length > 0) {
        const order = orders[0]; // pesanan terbaru
        if (order) {
          document.getElementById('inv-nomor').textContent = order.id;
          document.getElementById('inv-tanggal').textContent = 'Tanggal: ' + order.tanggal;
          document.getElementById('inv-nama-penerima').textContent = order.nama;
          document.getElementById('inv-telepon').textContent = 'WhatsApp: ' + order.telepon;
          document.getElementById('inv-alamat').textContent = order.alamat;
          document.getElementById('inv-kurir').textContent = order.kurir;
          document.getElementById('inv-metode').textContent = order.metode;

          document.getElementById('inv-subtotal').textContent = 'Rp ' + (order.subtotal || 0).toLocaleString('id-ID');
          document.getElementById('inv-ongkir').textContent = 'Rp ' + (order.ongkir || 0).toLocaleString('id-ID');
          document.getElementById('inv-layanan').textContent = 'Rp ' + (order.biayaLayanan || 0).toLocaleString('id-ID');
          document.getElementById('inv-total').textContent = 'Rp ' + (order.total || 0).toLocaleString('id-ID');

          if (order.items && order.items.length > 0) {
            const tbody = document.getElementById('inv-tabel-body');
            tbody.innerHTML = '';
            order.items.forEach((it, idx) => {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>
                  <strong>${it.nama}</strong><br>
                  <span style="font-size: 0.75rem; color: var(--warna-teks-redup);">Varian: ${it.varian || 'Standar'}</span>
                </td>
                <td>Rp ${(it.harga || 0).toLocaleString('id-ID')}</td>
                <td style="text-align: center;">${it.jumlah || 1}</td>
                <td>Rp ${((it.harga || 0) * (it.jumlah || 1)).toLocaleString('id-ID')}</td>
              `;
              tbody.appendChild(tr);
            });
          }
        }
      }
    } catch (e) {
      console.warn('Gagal memuat detail pesanan lokal:', e);
    }
  });
  </script>
</body>
</html>
