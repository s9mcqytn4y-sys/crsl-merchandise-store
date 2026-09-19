<?php
/**
 * CRSL Merchandise Store - Halaman Invoice Digital / Bukti Pembelian
 * Sesuai Standar UU ITE No. 11 Tahun 2008 & PP PSTE No. 71 Tahun 2019
 */

// Coba ambil pesanan dari DB berdasarkan nomor dari URL
$nomorPesananUrl = $nomorPesanan ?? null;
$pesananDb = null;

if ($nomorPesananUrl) {
    try {
        require_once ROOT_DIR . '/src/basis-data/PengelolaDatabase.php';
        require_once ROOT_DIR . '/src/pesanan/PengelolaPesanan.php';
        $dbInv = CRSL\BasisData\PengelolaDatabase::dapatkanKoneksi();
        $pengelolaInv = new CRSL\Pesanan\PengelolaPesanan($dbInv);
        $pesananDb = $pengelolaInv->ambilDetailPesanan($nomorPesananUrl);
    } catch (Exception $e) {
        $pesananDb = null;
    }
}

$nomorTampil  = $pesananDb['nomor_pesanan'] ?? $nomorPesananUrl ?? ('INV/CRSL/' . date('Ymd') . '/DEMO1');
$totalDb      = $pesananDb['total'] ?? 0;
$subtotalDb   = 0;
$ongkirDb     = $pesananDb['ongkir'] ?? 0;
$diskonDb     = $pesananDb['diskon'] ?? 0;
$kodeVoucher  = $pesananDb['kode_voucher'] ?? null;
$kurirDb      = $pesananDb['kurir'] ?? 'JNE Reguler';
$metodeBayar  = $pesananDb['metode_bayar'] ?? 'QRIS';
$alamatDb     = $pesananDb['alamat_kirim'] ?? '';
$itemsDb      = $pesananDb['items'] ?? [];
$waktuBayar   = $pesananDb['waktu_bayar'] ?? $pesananDb['dibuat_pada'] ?? date('Y-m-d H:i:s');
$statusDb     = $pesananDb['status'] ?? 'belum_bayar';

// Hitung subtotal dari items
foreach ($itemsDb as $it) {
    $subtotalDb += (int)($it['harga'] ?? 0) * (int)($it['jumlah'] ?? 1);
}
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
        <a href="/" class="navigasi__logo" aria-label="CRSL Beranda">
          <img src="/aset/gambar/logo-crsl.png" alt="CRSL" width="90" height="26">
        </a>
      </div>
      <div class="navigasi__kanan" style="display: flex; align-items: center; gap: 0.75rem;">
        <button type="button" id="tombol-tema" class="navigasi__tombol-ikon" aria-label="Ganti tema">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <a href="/akun" style="font-weight: 600; font-size: 0.9rem; color: var(--warna-primer);">
          Akun Saya
        </a>
      </div>
    </div>
  </header>

  <main class="invoice-halaman">
    <div class="invoice-lembar" id="lembar-faktur">
      <!-- Header Invoice -->
      <div class="invoice-header">
        <div class="invoice-header__brand">
          <div class="invoice-logo">
            <img src="/aset/gambar/logo-crsl.png" alt="CRSL Official Store" width="120" height="34">
          </div>
          <p style="font-size: 0.8rem; color: var(--warna-teks-redup); margin-top: 0.25rem;">
              PT Kreasi Hewan Sahabat (CRSL Official)<br>
              NPWP: 03.882.912.4-542.000<br>
              Jl. Seturan Raya, Caturtunggal, Depok, Sleman, DI Yogyakarta 55281
            </p>
          </div>
      <div class="invoice-header__title-box">
              <h1 class="invoice-title">FAKTUR PENJUALAN</h1>
              <div class="invoice-nomor" id="inv-nomor"><?= htmlspecialchars($nomorTampil) ?></div>
              <div style="font-size: 0.85rem; color: var(--warna-teks-redup); margin-top: 0.2rem;" id="inv-tanggal">
                Tanggal: <?= date('d F Y', strtotime($waktuBayar)) ?>
              </div>
              <?php
              $statusLabelMap = [
                'belum_bayar'  => ['BELUM DIBAYAR', '#f59e0b'],
                'akan_dikirim' => ['LUNAS / DIPROSES', '#10b981'],
                'dikirim'      => ['DALAM PENGIRIMAN', '#8b5cf6'],
                'selesai'      => ['SELESAI', '#10b981'],
                'kedaluwarsa'  => ['KEDALUWARSA', '#ef4444'],
                'dibatalkan'   => ['DIBATALKAN', '#9ca3af'],
              ];
              $sl = $statusLabelMap[$statusDb] ?? ['TERKONFIRMASI', '#10b981'];
              ?>
              <span class="invoice-badge-status" style="background: <?= $sl[1] ?>20; color: <?= $sl[1] ?>; border: 1px solid <?= $sl[1] ?>40;" id="inv-status"><?= $sl[0] ?></span>
            </div>
        </div>

        <!-- Info Pihak Terlibat -->
        <div class="invoice-parties">
          <div class="invoice-parties__box">
            <h4>Tujuan Pengiriman:</h4>
            <div style="font-weight: 700;" id="inv-nama-penerima"><?= htmlspecialchars(explode('(', $alamatDb)[0] ?? 'Pelanggan') ?></div>
            <div id="inv-telepon">WhatsApp: -</div>
            <div id="inv-alamat" style="color: var(--warna-teks-redup); margin-top: 0.25rem;">
              <?= htmlspecialchars($alamatDb) ?>
            </div>
          </div>
          <div class="invoice-parties__box">
            <h4>Metode Pengiriman &amp; Pembayaran:</h4>
            <div>Kurir: <strong id="inv-kurir"><?= htmlspecialchars($kurirDb) ?></strong></div>
            <div>Metode: <strong id="inv-metode"><?= htmlspecialchars($metodeBayar) ?></strong></div>
            <div>Status: <strong style="color: <?= $sl[1] ?>;"><?= $sl[0] ?></strong></div>
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
            <?php if (!empty($itemsDb)): ?>
              <?php foreach ($itemsDb as $idx => $it): ?>
              <tr>
                <td><?= $idx + 1 ?></td>
                <td>
                  <strong><?= htmlspecialchars($it['nama_produk'] ?? $it['nama'] ?? 'Produk CRSL') ?></strong><br>
                  <span style="font-size: 0.75rem; color: var(--warna-teks-redup);">
                    <?= htmlspecialchars($it['ukuran'] ?? $it['varian'] ?? '-') ?>
                    <?= !empty($it['tipe']) && $it['tipe'] === 'pre_order' ? '<span style="color: #e52027; font-weight: 700;"> [Pre-Order]</span>' : '' ?>
                  </span>
                </td>
                <td>Rp <?= number_format((int)($it['harga'] ?? 0), 0, ',', '.') ?></td>
                <td style="text-align: center;"><?= (int)($it['jumlah'] ?? 1) ?></td>
                <td>Rp <?= number_format((int)($it['harga'] ?? 0) * (int)($it['jumlah'] ?? 1), 0, ',', '.') ?></td>
              </tr>
              <?php endforeach; ?>
            <?php else: ?>
            <tr>
              <td>1</td>
              <td><strong>CRSL Cassie Wallet | Dompet Lipat Canvas Wanita</strong><br><span style="font-size: 0.75rem; color: var(--warna-teks-redup);">Varian: CHILO PINK</span></td>
              <td>Rp 179.100</td>
              <td style="text-align: center;">1</td>
              <td>Rp 179.100</td>
            </tr>
            <?php endif; ?>
          </tbody>
        </table>

        <div class="invoice-summary">
          <div class="invoice-summary__table">
            <div class="invoice-summary__row">
              <span>Subtotal Produk</span>
              <span id="inv-subtotal">Rp <?= number_format($subtotalDb, 0, ',', '.') ?></span>
            </div>
            <?php if ($diskonDb > 0): ?>
            <div class="invoice-summary__row" style="color: #059669;">
              <span>Diskon<?= $kodeVoucher ? ' (' . htmlspecialchars($kodeVoucher) . ')' : '' ?></span>
              <span id="inv-diskon">-Rp <?= number_format($diskonDb, 0, ',', '.') ?></span>
            </div>
            <?php endif; ?>
            <div class="invoice-summary__row">
              <span>Ongkos Kirim (<?= htmlspecialchars($kurirDb) ?>)</span>
              <span id="inv-ongkir">Rp <?= number_format($ongkirDb, 0, ',', '.') ?></span>
            </div>
            <div class="invoice-summary__row">
              <span>Asuransi &amp; Biaya Layanan</span>
              <span id="inv-layanan">Rp <?= number_format(max(0, $totalDb - $subtotalDb - $ongkirDb + $diskonDb), 0, ',', '.') ?></span>
            </div>
            <div class="invoice-summary__row invoice-summary__row--total">
              <span>Total Pembayaran</span>
              <span id="inv-total">Rp <?= number_format($totalDb, 0, ',', '.') ?></span>
            </div>
          </div>
        </div>

        <!-- Legal Notice -->
        <div style="font-size: 0.75rem; color: var(--warna-teks-redup); border-top: 1px dashed #e5e7eb; padding-top: 1rem; margin-top: 1rem; line-height: 1.6;">
          <p style="font-weight: 700; margin-bottom: 0.4rem;">Ketentuan Hukum &amp; Garansi</p>
          <p>Faktur ini merupakan dokumen transaksi elektronik yang sah berdasarkan <strong>UU ITE No. 11 Tahun 2008</strong> dan perubahannya, serta <strong>PP No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik (PP PSTE)</strong>. Dokumen ini diterbitkan secara otomatis oleh sistem komputer CRSL Official Store dan memiliki kekuatan hukum yang setara dengan dokumen tertulis.</p>
          <p style="margin-top: 0.5rem;"><strong>Garansi Produk:</strong> Garansi resmi berlaku 30 (tiga puluh) hari sejak tanggal penerimaan barang. Klaim garansi wajib disertai faktur ini sebagai bukti pembelian sah. Kerusakan akibat kesalahan pengguna tidak termasuk dalam cakupan garansi.</p>
          <p style="margin-top: 0.5rem;"><strong>Kebijakan Pengembalian:</strong> Pengembalian barang (retur) dapat dilakukan dalam 3 hari kerja sejak barang diterima, dengan syarat barang dalam kondisi semula dan disertai kemasan asli. Biaya pengiriman retur menjadi tanggung jawab pembeli kecuali terdapat cacat produksi.</p>
          <p style="margin-top: 0.5rem;">Untuk informasi lebih lanjut, hubungi tim CS CRSL via WhatsApp: <strong>+62 812-2345-6789</strong> atau email: <strong>cs@crsl-store.id</strong></p>
          <p style="margin-top: 0.5rem; opacity: 0.7;">Diterbitkan oleh sistem CRSL pada: <?= date('d F Y H:i', strtotime($waktuBayar)) ?> WIB &bull; ID Transaksi: <?= htmlspecialchars($nomorTampil) ?></p>
        </div>

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

  <script src="/js/komponen/navigasi.js"></script>
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
