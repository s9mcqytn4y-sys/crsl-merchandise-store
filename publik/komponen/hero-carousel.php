<?php
/**
 * Komponen Hero Banner Carousel
 * - 4 Slide Banner WebP
 * - Nilai proposisi langsung dipahami pengguna
 * - Dot kapsul loading animasi di bawah tengah gambar
 */
$banners = [
  [
    'gambar' => '/aset/gambar/banner-1.webp',
    'tag' => 'New Season',
    'judul' => 'Animals as your Bestfriends!',
    'subjudul' => 'Merchandise karakter hewan lucu & fungsional untuk menemani hari-harimu.',
    'tombol' => 'Adopt now',
    'tautan' => 'https://crsl-store.id/products',
    'target_eksternal' => true,
    'alt' => 'CRSL Koleksi Terbaru'
  ],
  [
    'gambar' => '/aset/gambar/banner-bts.webp',
    'tag' => 'BTS Essentials',
    'judul' => 'Back to School with Odin & Friends',
    'subjudul' => 'Ransel water-repellent, kapasitas laptop 14 inci, dan kompartemen lengkap.',
    'tombol' => 'Lihat Ransel',
    'tautan' => '/kategori/backpack-collection',
    'alt' => 'CRSL Back to School Essentials'
  ],
  [
    'gambar' => '/aset/gambar/banner-tumbler.webp',
    'tag' => 'Everyday Hydration',
    'judul' => 'Tumbler Termos 12 Jam Dingin',
    'subjudul' => 'Stainless steel food-grade anti tumpah dengan karakter imut Popo si Panda.',
    'tombol' => 'Pilih Tumbler',
    'tautan' => '/kategori/tumbler-collection',
    'alt' => 'CRSL Tumbler Collection'
  ],
  [
    'gambar' => '/aset/gambar/banner-cassie.webp',
    'tag' => 'Best Seller',
    'judul' => 'Compact & Stylish Cassie Wallet',
    'subjudul' => 'Dompet kanvas lipat wanita dengan motif plaid ikonik dan slot kartu lengkap.',
    'tombol' => 'Beli Cassie Wallet',
    'tautan' => '/kategori/wallet-accessories',
    'alt' => 'CRSL Cassie Wallet'
  ],
  [
    'gambar' => '/aset/gambar/banner-2.webp',
    'tag' => 'Special Edition',
    'judul' => 'Meet The 5 Bestfriends Squad',
    'subjudul' => 'Temukan kepribadianmu bersama Odin, Chilo, Pigko, Popo, dan Choco.',
    'tombol' => 'Kenali Karakter',
    'tautan' => '#karakter-showcase',
    'alt' => 'CRSL Animal Characters'
  ]
];
?>
<section class="hero" aria-label="Sorotan Utama CRSL">
  <!-- Track Carousel -->
  <div class="hero__track">
    <?php foreach ($banners as $index => $b): ?>
      <div class="hero__slide" role="group" aria-roledescription="slide" aria-label="Slide <?= $index + 1 ?> dari <?= count($banners) ?>">
        <div class="hero__gambar-wadah">
          <img
            src="<?= htmlspecialchars($b['gambar']) ?>"
            alt="<?= htmlspecialchars($b['alt']) ?>"
            class="hero__gambar"
            loading="<?= $index === 0 ? 'eager' : 'lazy' ?>"
            fetchpriority="<?= $index === 0 ? 'high' : 'auto' ?>"
          >
          <div class="hero__overlay"></div>
        </div>

        <div class="hero__konten">
          <span class="hero__tag"><?= htmlspecialchars($b['tag']) ?></span>
          <h2 class="hero__judul"><?= htmlspecialchars($b['judul']) ?></h2>
          <p class="hero__subjudul"><?= htmlspecialchars($b['subjudul']) ?></p>
          <a
            href="<?= htmlspecialchars($b['tautan']) ?>"
            class="hero__cta"
            <?= !empty($b['target_eksternal']) ? 'target="_blank" rel="noopener noreferrer"' : '' ?>
          >
            <?= htmlspecialchars($b['tombol']) ?>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <!-- Tombol Navigasi Halus Kiri & Kanan -->
  <button type="button" class="hero__panah hero__panah--kiri" aria-label="Slide sebelumnya">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
  </button>
  <button type="button" class="hero__panah hero__panah--kanan" aria-label="Slide berikutnya">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
  </button>

  <!-- Indikator Dot Kapsul Interaktif (Didalam Bawah Tengah Gambar) -->
  <div class="hero__dots" role="tablist" aria-label="Pilih slide sorotan">
    <?php foreach ($banners as $index => $b): ?>
      <button
        type="button"
        class="hero__dot <?= $index === 0 ? 'aktif' : '' ?>"
        role="tab"
        aria-selected="<?= $index === 0 ? 'true' : 'false' ?>"
        aria-label="Lompat ke slide <?= $index + 1 ?>"
      >
        <span class="hero__dot-progress"></span>
      </button>
    <?php endforeach; ?>
  </div>
</section>
