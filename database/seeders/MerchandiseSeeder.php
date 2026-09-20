<?php

namespace Database\Seeders;

use App\Models\GambarProduk;
use App\Models\Kategori;
use App\Models\Produk;
use App\Models\ProdukSpesifikasi;
use App\Models\ProdukVarian;
use App\Models\TierLoyalitas;
use App\Models\Voucher;
use App\Models\WilayahIndonesia;
use Illuminate\Database\Seeder;

class MerchandiseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Kategori
        $kategoriList = [
            ['id' => 1, 'nama' => 'BTS Collection', 'slug' => 'back-to-school-essentials', 'emoji' => '🎒', 'urutan' => 1, 'aktif' => true],
            ['id' => 2, 'nama' => 'All Products', 'slug' => 'all-products', 'emoji' => null, 'urutan' => 2, 'aktif' => true],
            ['id' => 3, 'nama' => 'All Day Promo', 'slug' => 'discounts', 'emoji' => '🔥', 'urutan' => 3, 'aktif' => true],
            ['id' => 4, 'nama' => 'Backpacks', 'slug' => 'backpack-collection', 'emoji' => null, 'urutan' => 4, 'aktif' => true],
            ['id' => 5, 'nama' => 'Slingbags', 'slug' => 'slingbag-collection', 'emoji' => null, 'urutan' => 5, 'aktif' => true],
            ['id' => 6, 'nama' => 'Tumbler Collection', 'slug' => 'tumbler-collection', 'emoji' => null, 'urutan' => 6, 'aktif' => true],
            ['id' => 7, 'nama' => 'Tops', 'slug' => 'tops-collection', 'emoji' => null, 'urutan' => 7, 'aktif' => true],
            ['id' => 8, 'nama' => 'Bottoms', 'slug' => 'bottoms-collection', 'emoji' => null, 'urutan' => 8, 'aktif' => true],
            ['id' => 9, 'nama' => 'Outerwears', 'slug' => 'outerwears-collection', 'emoji' => null, 'urutan' => 9, 'aktif' => true],
            ['id' => 10, 'nama' => 'Footwears', 'slug' => 'footwear-collection', 'emoji' => null, 'urutan' => 10, 'aktif' => true],
            ['id' => 11, 'nama' => 'Headwears', 'slug' => 'headwear-collection', 'emoji' => null, 'urutan' => 11, 'aktif' => true],
            ['id' => 12, 'nama' => 'Wallet & Accessories', 'slug' => 'wallet-accessories', 'emoji' => null, 'urutan' => 12, 'aktif' => true],
            ['id' => 13, 'nama' => 'What\'s Poppin\'', 'slug' => 'whats-poppin', 'emoji' => null, 'urutan' => 13, 'aktif' => true],
        ];

        foreach ($kategoriList as $kat) {
            Kategori::updateOrCreate(['id' => $kat['id']], $kat);
        }

        // 2. Seed Tier Loyalitas
        $tierList = [
            ['id' => 1, 'nama' => 'New Freen', 'slug' => 'new-freen', 'syarat_belanja' => 0, 'bonus_poin_masuk' => 100, 'poin_per_ulasan' => 100, 'warna_aksen' => '#3b82f6', 'urutan' => 1],
            ['id' => 2, 'nama' => 'Bestfreen', 'slug' => 'bestfreen', 'syarat_belanja' => 500000, 'bonus_poin_masuk' => 500, 'poin_per_ulasan' => 200, 'warna_aksen' => '#e52027', 'urutan' => 2],
            ['id' => 3, 'nama' => 'CRSL Gengs', 'slug' => 'crsl-gengs', 'syarat_belanja' => 2000000, 'bonus_poin_masuk' => 2000, 'poin_per_ulasan' => 500, 'warna_aksen' => '#eab308', 'urutan' => 3],
        ];

        foreach ($tierList as $tier) {
            TierLoyalitas::updateOrCreate(['id' => $tier['id']], $tier);
        }

        // 3. Seed Voucher
        $voucherList = [
            ['id' => 1, 'kode' => 'CRSLBESTIE10', 'judul' => 'Diskon Sahabat 10%', 'tipe' => 'persen', 'nilai' => 10, 'min_belanja' => 100000, 'kuota' => 500, 'aktif' => true],
            ['id' => 2, 'kode' => 'FREEONGKIR20', 'judul' => 'Potongan Ongkir Rp20.000', 'tipe' => 'ongkir', 'nilai' => 20000, 'min_belanja' => 150000, 'kuota' => 1000, 'aktif' => true],
        ];

        foreach ($voucherList as $v) {
            Voucher::updateOrCreate(['id' => $v['id']], $v);
        }

        // 4. Seed Wilayah Indonesia (Sample Sleman Yogyakarta)
        WilayahIndonesia::updateOrCreate(
            ['kode_pos' => '55281'],
            [
                'provinsi' => 'D.I. Yogyakarta',
                'kota' => 'Sleman',
                'tipe' => 'Kabupaten',
                'kecamatan' => 'Depok',
                'kelurahan' => 'Caturtunggal',
                'biteship_area_id' => 'IDNP11KOT789311',
            ]
        );

        // 5. Seed Produk
        $produkList = [
            [
                'id' => 1,
                'kategori_id' => 12,
                'nama' => 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid',
                'slug' => 'crsl-cassie-wallet',
                'deskripsi' => 'Dompet lipat stylish motif plaid dengan pilihan varian Chilo Pink dan Choco Brown. Ringkas, awet, dan fungsional untuk kartu serta uang harian.',
                'harga_dasar' => 199000,
                'harga_diskon' => 179100,
                'stok_total' => 50,
                'berat_gram' => 150,
                'gambar_utama' => '/assets/gambar/cassie-wallet.webp',
                'aktif' => true,
                'is_best_seller' => true,
            ],
            [
                'id' => 2,
                'kategori_id' => 4,
                'nama' => 'CRSL Odin Fluffy Backpack | Tas Ransel Sekolah Dinosaurus Hijau',
                'slug' => 'crsl-odin-fluffy-backpack',
                'deskripsi' => 'Ransel kapasitas besar dengan kompartemen laptop 14 inci, bahan water-repellent, dan aksen karakter Odin si Dinosaurus petualang.',
                'harga_dasar' => 329000,
                'harga_diskon' => 296100,
                'stok_total' => 35,
                'berat_gram' => 600,
                'gambar_utama' => '/assets/gambar/banner-bts.webp',
                'aktif' => true,
                'is_best_seller' => true,
            ],
            [
                'id' => 3,
                'kategori_id' => 5,
                'nama' => 'CRSL Chilo Canvas Slingbag | Tas Selempang Lucu Kucing Pink',
                'slug' => 'crsl-chilo-canvas-slingbag',
                'deskripsi' => 'Slingbag praktis berbahan kanvas premium dengan bordir karakter Chilo si Kucing imut. Pas untuk hangout harian.',
                'harga_dasar' => 219000,
                'harga_diskon' => 197100,
                'stok_total' => 40,
                'berat_gram' => 300,
                'gambar_utama' => '/assets/gambar/cassie-wallet.webp',
                'aktif' => true,
                'is_best_seller' => false,
            ],
            [
                'id' => 4,
                'kategori_id' => 6,
                'nama' => 'CRSL Popo Vacuum Tumbler 500ml | Stainless Steel Panda',
                'slug' => 'crsl-popo-vacuum-tumbler',
                'deskripsi' => 'Tumbler termos tahan panas dan dingin hingga 12 jam. Desain minimalis dengan grafis Popo si Panda santai.',
                'harga_dasar' => 189000,
                'harga_diskon' => 170100,
                'stok_total' => 60,
                'berat_gram' => 400,
                'gambar_utama' => '/assets/gambar/banner-tumbler.webp',
                'aktif' => true,
                'is_best_seller' => true,
            ],
            [
                'id' => 5,
                'kategori_id' => 9,
                'nama' => 'CRSL Choco Oversized Hoodie | Jaket Hangat Beruang Cokelat',
                'slug' => 'crsl-choco-oversized-hoodie',
                'deskripsi' => 'Hoodie oversized bahan fleece katun lembut yang nyaman dan hangat. Dilengkapi patch karakter Choco di dada.',
                'harga_dasar' => 389000,
                'harga_diskon' => 350100,
                'stok_total' => 25,
                'berat_gram' => 750,
                'gambar_utama' => '/assets/gambar/banner-1.webp',
                'aktif' => true,
                'is_best_seller' => false,
            ],
            [
                'id' => 6,
                'kategori_id' => 11,
                'nama' => 'CRSL Pigko Cheerful Cap | Topi Baseball Karakter Peach Pig',
                'slug' => 'crsl-pigko-cheerful-cap',
                'deskripsi' => 'Topi baseball kasual dengan strap adjustable di belakang dan bordir presisi Pigko si Babi ceria.',
                'harga_dasar' => 149000,
                'harga_diskon' => 134100,
                'stok_total' => 45,
                'berat_gram' => 120,
                'gambar_utama' => '/assets/gambar/banner-2.webp',
                'aktif' => true,
                'is_best_seller' => false,
            ],
            [
                'id' => 7,
                'kategori_id' => 6,
                'nama' => 'CRSL Drinke Tumblr Series | Botol Tempat Minum Stainless 900ml',
                'slug' => 'crsl-drinke-tumblr-series',
                'deskripsi' => 'Miliki koleksi Drinke Tumblr Series 900ml eksklusif dengan 5 karakter sahabat CRSL. Menjaga suhu minuman tetap dingin hingga 12 jam, dirancang tahan bocor dan siap menemani petualangan harianmu.',
                'harga_dasar' => 289000,
                'harga_diskon' => 289000,
                'stok_total' => 445,
                'berat_gram' => 500,
                'gambar_utama' => '/assets/gambar/drinke-tumblr.webp',
                'aktif' => true,
                'is_best_seller' => true,
            ],
        ];

        foreach ($produkList as $p) {
            Produk::updateOrCreate(['id' => $p['id']], $p);
        }

        // 6. Seed Varian Produk
        $varianList = [
            ['id' => 1, 'produk_id' => 1, 'sku' => 'CRSL-WLT-CASSIE-PNK', 'nama_varian' => 'CHILO PINK', 'tipe_varian' => 'warna', 'warna' => 'Pink', 'warna_hex' => '#ec4899', 'ukuran' => 'All Size', 'harga_tambahan' => 0, 'stok' => 45, 'gambar_varian' => '/assets/gambar/cassie-wallet.webp', 'aktif' => true],
            ['id' => 2, 'produk_id' => 1, 'sku' => 'CRSL-WLT-CASSIE-BRN', 'nama_varian' => 'CHOCO BROWN', 'tipe_varian' => 'warna', 'warna' => 'Brown', 'warna_hex' => '#78350f', 'ukuran' => 'All Size', 'harga_tambahan' => 0, 'stok' => 30, 'gambar_varian' => '/assets/gambar/cassie-wallet.webp', 'aktif' => true],
            ['id' => 3, 'produk_id' => 1, 'sku' => 'CRSL-WLT-CASSIE-GRN', 'nama_varian' => 'ODIN GREEN', 'tipe_varian' => 'warna', 'warna' => 'Green', 'warna_hex' => '#15803d', 'ukuran' => 'All Size', 'harga_tambahan' => 0, 'stok' => 20, 'gambar_varian' => '/assets/gambar/cassie-wallet.webp', 'aktif' => true],

            ['id' => 4, 'produk_id' => 7, 'sku' => 'CRSL-TMB-DRN-32-CHILO', 'nama_varian' => 'CHILO PINK', 'tipe_varian' => 'karakter', 'warna' => 'Pink', 'warna_hex' => '#ec4899', 'ukuran' => '900ml / 32oz', 'harga_tambahan' => 0, 'stok' => 100, 'gambar_varian' => '/assets/gambar/drinke-tumblr.webp', 'aktif' => true],
            ['id' => 5, 'produk_id' => 7, 'sku' => 'CRSL-TMB-DRN-32-POPO', 'nama_varian' => 'POPO BLUE', 'tipe_varian' => 'karakter', 'warna' => 'Blue', 'warna_hex' => '#3b82f6', 'ukuran' => '900ml / 32oz', 'harga_tambahan' => 0, 'stok' => 100, 'gambar_varian' => '/assets/gambar/drinke-tumblr.webp', 'aktif' => true],
            ['id' => 6, 'produk_id' => 7, 'sku' => 'CRSL-TMB-DRN-32-ODIN', 'nama_varian' => 'ODIN YELLOW', 'tipe_varian' => 'karakter', 'warna' => 'Yellow', 'warna_hex' => '#eab308', 'ukuran' => '900ml / 32oz', 'harga_tambahan' => 0, 'stok' => 80, 'gambar_varian' => '/assets/gambar/drinke-tumblr.webp', 'aktif' => true],
            ['id' => 7, 'produk_id' => 7, 'sku' => 'CRSL-TMB-DRN-32-CHOCO', 'nama_varian' => 'CHOCO GREY', 'tipe_varian' => 'karakter', 'warna' => 'Grey', 'warna_hex' => '#6b7280', 'ukuran' => '900ml / 32oz', 'harga_tambahan' => 0, 'stok' => 75, 'gambar_varian' => '/assets/gambar/drinke-tumblr.webp', 'aktif' => true],
            ['id' => 8, 'produk_id' => 7, 'sku' => 'CRSL-TMB-DRN-32-PIGKO', 'nama_varian' => 'PIGKO PEACH', 'tipe_varian' => 'karakter', 'warna' => 'Peach', 'warna_hex' => '#f97316', 'ukuran' => '900ml / 32oz', 'harga_tambahan' => 0, 'stok' => 90, 'gambar_varian' => '/assets/gambar/drinke-tumblr.webp', 'aktif' => true],
        ];

        foreach ($varianList as $v) {
            ProdukVarian::updateOrCreate(['id' => $v['id']], $v);
        }

        // 7. Seed Spesifikasi Produk
        $spesifikasiList = [
            ['id' => 1, 'produk_id' => 1, 'kunci' => 'Material', 'nilai' => 'Premium Durable Canvas & Plaid Lining', 'urutan' => 1],
            ['id' => 2, 'produk_id' => 1, 'kunci' => 'Kompartemen', 'nilai' => '6 Slot Kartu, 1 Slot Uang Kertas, 1 Kantong Koin Resleting', 'urutan' => 2],
            ['id' => 3, 'produk_id' => 1, 'kunci' => 'Dimensi', 'nilai' => '11 cm x 9.5 cm x 2 cm', 'urutan' => 3],

            ['id' => 5, 'produk_id' => 7, 'kunci' => 'Material', 'nilai' => 'Food Grade SUS 304 Stainless Steel (BPA Free)', 'urutan' => 1],
            ['id' => 6, 'produk_id' => 7, 'kunci' => 'Kapasitas', 'nilai' => '900 ml / 32 oz', 'urutan' => 2],
            ['id' => 7, 'produk_id' => 7, 'kunci' => 'Retensi Suhu', 'nilai' => 'Dingin hingga 12 Jam, Hangat hingga 8 Jam', 'urutan' => 3],
            ['id' => 8, 'produk_id' => 7, 'kunci' => 'Tutup', 'nilai' => 'Leak-Proof Twist Lid dengan Silicone Straw Reusable', 'urutan' => 4],
            ['id' => 9, 'produk_id' => 7, 'kunci' => 'Bonus', 'nilai' => 'Exclusive Sticker Pack 5 Karakter Sahabat CRSL', 'urutan' => 5],
        ];

        foreach ($spesifikasiList as $spec) {
            ProdukSpesifikasi::updateOrCreate(['id' => $spec['id']], $spec);
        }

        // 8. Seed Gambar Produk
        $gambarList = [
            ['id' => 1, 'produk_id' => 1, 'url' => '/assets/gambar/cassie-wallet.webp', 'alt_teks' => 'CRSL Cassie Wallet Tampilan Depan', 'urutan' => 1],
            ['id' => 2, 'produk_id' => 1, 'url' => '/assets/gambar/banner-cassie.webp', 'alt_teks' => 'CRSL Cassie Wallet Motif Plaid & Kompartemen', 'urutan' => 2],
            ['id' => 3, 'produk_id' => 1, 'url' => '/assets/gambar/banner-1.webp', 'alt_teks' => 'CRSL Cassie Wallet Model Lifestyle', 'urutan' => 3],

            ['id' => 15, 'produk_id' => 7, 'url' => '/assets/gambar/drinke-tumblr.webp', 'alt_teks' => 'CRSL Drinke Tumblr Series 5 Karakter', 'urutan' => 1],
            ['id' => 16, 'produk_id' => 7, 'url' => '/assets/gambar/banner-tumbler.webp', 'alt_teks' => 'CRSL Drinke Tumblr Series Retensi Dingin 12 Jam', 'urutan' => 2],
            ['id' => 17, 'produk_id' => 7, 'url' => '/assets/gambar/banner-bts.webp', 'alt_teks' => 'CRSL Drinke Tumblr Series Detail Silicone Straw', 'urutan' => 3],
        ];

        foreach ($gambarList as $img) {
            GambarProduk::updateOrCreate(['id' => $img['id']], $img);
        }
    }
}
