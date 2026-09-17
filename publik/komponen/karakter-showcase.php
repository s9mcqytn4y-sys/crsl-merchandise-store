<?php
/**
 * Komponen Karakter Showcase
 * 5 Karakter Inti CRSL: Odin, Chilo, Pigko, Popo, Choco
 */
$karakterList = [
  [
    'id' => 'odin',
    'nama' => 'Odin',
    'spesies' => 'Dinosaurus',
    'emoji' => '🦖',
    'warna' => '#10B981',
    'kutipan' => 'Keberanian dimulai saat kamu melangkah bersama sahabat.',
    'deskripsi' => 'Odin adalah dinosaurus hijau yang penuh rasa ingin tahu dan jiwa petualang tinggi. Selalu sigap memimpin petualangan seru dan setia menemani langkahmu ke mana pun.',
    'sifat' => ['Petualang', 'Pemberani', 'Setia Kawan', 'Eksploratif'],
    'kategori' => 'Koleksi Backpack & Petualangan',
    'tautan' => '/kategori/backpack-collection'
  ],
  [
    'id' => 'chilo',
    'nama' => 'Chilo',
    'spesies' => 'Kucing Manis',
    'emoji' => '🐱',
    'warna' => '#EC4899',
    'kutipan' => 'Kreativitas dan sentuhan estetika membuat setiap hari lebih berwarna.',
    'deskripsi' => 'Chilo si kucing imut yang gemar bereksperimen dengan seni, mode, dan warna. Pembawa keceriaan dengan gaya modis yang menginspirasi gaya harianmu.',
    'sifat' => ['Artistik', 'Manis', 'Kreatif', 'Penyayang'],
    'kategori' => 'Koleksi Slingbag & Aksesoris',
    'tautan' => '/kategori/slingbag-collection'
  ],
  [
    'id' => 'pigko',
    'nama' => 'Pigko',
    'spesies' => 'Babi Ceria',
    'emoji' => '🐷',
    'warna' => '#F472B6',
    'kutipan' => 'Kebahagiaan sejati adalah berbagi tawa renyah dan camilan lezat!',
    'deskripsi' => 'Pigko si babi ceria berbadan bulat menggemaskan yang selalu membawa suasana hangat. Pecinta kuliner sejati yang selalu membuat harimu penuh senyuman.',
    'sifat' => ['Ceria', 'Pecinta Kuliner', 'Humoris', 'Hangat'],
    'kategori' => 'Koleksi Topi & Pakaian Santai',
    'tautan' => '/kategori/headwear-collection'
  ],
  [
    'id' => 'popo',
    'nama' => 'Popo',
    'spesies' => 'Panda Bijak',
    'emoji' => '🐼',
    'warna' => '#2D3748',
    'kutipan' => 'Tenang, nikmati setiap tegukan proses, dan tetaplah rendah hati.',
    'deskripsi' => 'Popo si panda santai dengan ketenangan luar biasa. Tempat berbagi cerita terbaik yang selalu mendengarkan dan mengingatkanmu untuk hidup seimbang.',
    'sifat' => ['Tenang', 'Bijaksana', 'Santai', 'Pendengar Baik'],
    'kategori' => 'Koleksi Tumbler & Hidrasi',
    'tautan' => '/kategori/tumbler-collection'
  ],
  [
    'id' => 'choco',
    'nama' => 'Choco',
    'spesies' => 'Beruang Pelindung',
    'emoji' => '🐻',
    'warna' => '#8B5A2B',
    'kutipan' => 'Sahabat terbaik adalah sandaran hangat saat dunia terasa melelahkan.',
    'deskripsi' => 'Choco beruang cokelat bertubuh tegap berhati lembut. Selalu menjadi pelindung setia bagi teman-temannya dengan pelukan yang menenangkan.',
    'sifat' => ['Pelindung', 'Tulus', 'Dapat Diandalkan', 'Penuh Empati'],
    'kategori' => 'Koleksi Outerwear & Hoodie Hangat',
    'tautan' => '/kategori/outerwears-collection'
  ]
];
?>
<section class="karakter seksi-dinamis muncul-saat-scroll" id="karakter-showcase" aria-label="Showcase Karakter CRSL">
  <div class="karakter__header">
    <span class="karakter__tag">Meet The Bestfriends</span>
    <h2 class="karakter__judul">5 Sahabat Karakter CRSL</h2>
    <p class="karakter__subjudul">
      Bukan sekadar merchandise, setiap karakter mewakili cerita, gaya, dan kepribadian autentik untuk menemanimu setiap hari.
    </p>
  </div>

  <!-- Tab Selector 5 Karakter -->
  <div class="karakter__tabs" role="tablist" aria-label="Pilih Karakter">
    <?php foreach ($karakterList as $index => $k): ?>
      <button
        type="button"
        class="karakter__tab <?= $index === 0 ? 'aktif' : '' ?>"
        role="tab"
        id="tab-<?= $k['id'] ?>"
        data-karakter="<?= $k['id'] ?>"
        aria-selected="<?= $index === 0 ? 'true' : 'false' ?>"
        aria-controls="panel-<?= $k['id'] ?>"
      >
        <span class="karakter__tab-avatar" aria-hidden="true"><?= $k['emoji'] ?></span>
        <span><?= $k['nama'] ?></span>
      </button>
    <?php endforeach; ?>
  </div>

  <!-- Panel Rincian Masing-Masing Karakter -->
  <?php foreach ($karakterList as $index => $k): ?>
    <div
      class="karakter__panel <?= $index === 0 ? 'aktif' : '' ?>"
      id="panel-<?= $k['id'] ?>"
      role="tabpanel"
      aria-labelledby="tab-<?= $k['id'] ?>"
    >
      <!-- Kartu Visual Kiri -->
      <div class="karakter__kartu-kiri karakter__kartu-kiri--<?= $k['id'] ?>">
        <div class="karakter__ikon-besar" aria-hidden="true"><?= $k['emoji'] ?></div>
        <h3 class="karakter__nama-besar"><?= $k['nama'] ?></h3>
        <span class="karakter__spesies"><?= $k['spesies'] ?></span>
      </div>

      <!-- Detail Deskripsi Kanan -->
      <div class="karakter__kartu-kanan">
        <blockquote class="karakter__kutipan">
          &ldquo;<?= $k['kutipan'] ?>&rdquo;
        </blockquote>
        <p class="karakter__deskripsi">
          <?= $k['deskripsi'] ?>
        </p>

        <div class="karakter__sifat-wadah" aria-label="Sifat karakter">
          <?php foreach ($k['sifat'] as $s): ?>
            <span class="karakter__sifat"><?= $s ?></span>
          <?php endforeach; ?>
        </div>

        <a href="<?= htmlspecialchars($k['tautan']) ?>" class="karakter__cta">
          Lihat <?= htmlspecialchars($k['kategori']) ?>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </div>
  <?php endforeach; ?>
</section>
