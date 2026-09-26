<?php

namespace Database\Seeders;

use App\Models\GambarProduk;
use App\Models\Kategori;
use App\Models\Produk;
use App\Models\ProdukSpesifikasi;
use App\Models\ProdukVarian;
use App\Models\Voucher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProdukResmiSeeder extends Seeder
{
    /**
     * Seed katalog produk resmi, varian warna/spesifikasi, dan voucher diskon.
     */
    public function run(): void
    {
        // 1. Voucher Resmi Diskon (Sesuai Screenshot 5: CRSLYAY25 & Ongkir Rp 10.000)
        Voucher::updateOrCreate(
            ['kode' => 'CRSLYAY25'],
            [
                'judul'        => 'CRSL PAYDAY 25% OFF',
                'tipe'         => 'persen',
                'nilai'        => 25,
                'min_belanja'  => 50000,
                'kuota'        => 1000,
                'aktif'        => true,
                'berlaku_sampai' => now()->addDays(30),
            ]
        );

        Voucher::updateOrCreate(
            ['kode' => 'CRSLFREEONGKIR'],
            [
                'judul'        => 'Potongan Ongkir Rp 10.000',
                'tipe'         => 'ongkir',
                'nilai'        => 10000,
                'min_belanja'  => 75000,
                'kuota'        => 2000,
                'aktif'        => true,
                'berlaku_sampai' => now()->addDays(30),
            ]
        );

        // 2. Produk 1: Tumbler Travel Bottle Stainless 900ml 32oz (Sesuai Screenshot 2)
        $tumbler = Produk::updateOrCreate(
            ['slug' => 'tumbler-travel-bottle-stainless-900ml-32oz'],
            [
                'kategori_id'    => 6, // Tumbler Collection
                'nama'           => 'Tumbler Travel Bottle Stainless 900ml 32oz',
                'deskripsi'      => 'Botol minum tumbler stainless steel 900ml (32oz) berstandar food grade SUS 304. Menjaga minuman dingin hingga 12 jam dan hangat hingga 8 jam. Desain leak-proof ergonomis dengan pegangan kokoh, sempurna untuk mobilitas harian, kuliah, kantor, dan travelling.',
                'harga_dasar'    => 339000,
                'harga_diskon'   => 289000, // Diskon 14%
                'stok_total'     => 145,
                'berat_gram'     => 600,
                'gambar_utama'   => '/assets/gambar/drinke-tumblr.webp',
                'aktif'          => true,
                'is_best_seller' => true,
            ]
        );

        // Varian Tumbler (Dusty Pink, Broken White, Dark Grey)
        $varianTumbler = [
            [
                'sku'           => 'CRSL-TMB-32-DPK',
                'nama_varian'   => 'Dusty Pink',
                'tipe_varian'   => 'warna',
                'warna'         => 'Dusty Pink',
                'warna_hex'     => '#E892A2',
                'ukuran'        => '900ml / 32oz',
                'harga_tambahan'=> 0,
                'stok'          => 50,
                'gambar_varian' => '/assets/gambar/drinke-tumblr.webp',
                'aktif'         => true,
            ],
            [
                'sku'           => 'CRSL-TMB-32-BWH',
                'nama_varian'   => 'Broken White',
                'tipe_varian'   => 'warna',
                'warna'         => 'Broken White',
                'warna_hex'     => '#F4F1EA',
                'ukuran'        => '900ml / 32oz',
                'harga_tambahan'=> 0,
                'stok'          => 60,
                'gambar_varian' => '/assets/gambar/banner-tumbler.webp',
                'aktif'         => true,
            ],
            [
                'sku'           => 'CRSL-TMB-32-DGR',
                'nama_varian'   => 'Dark Grey',
                'tipe_varian'   => 'warna',
                'warna'         => 'Dark Grey',
                'warna_hex'     => '#4A4A4A',
                'ukuran'        => '900ml / 32oz',
                'harga_tambahan'=> 0,
                'stok'          => 35,
                'gambar_varian' => '/assets/gambar/banner-bts.webp',
                'aktif'         => true,
            ],
        ];

        foreach ($varianTumbler as $v) {
            ProdukVarian::updateOrCreate(
                ['produk_id' => $tumbler->id, 'sku' => $v['sku']],
                array_merge($v, ['produk_id' => $tumbler->id])
            );
        }

        // Galeri Gambar Tumbler
        $gambarTumbler = [
            ['url' => '/assets/gambar/drinke-tumblr.webp', 'alt_teks' => 'Tumbler Travel Bottle Stainless 900ml 32oz Main', 'urutan' => 1],
            ['url' => '/assets/gambar/banner-tumbler.webp', 'alt_teks' => 'Tumbler Travel Bottle Retensi Dingin 12 Jam', 'urutan' => 2],
            ['url' => '/assets/gambar/banner-bts.webp', 'alt_teks' => 'Tumbler Travel Bottle Ergonomic Grip & Straw', 'urutan' => 3],
        ];

        foreach ($gambarTumbler as $img) {
            GambarProduk::updateOrCreate(
                ['produk_id' => $tumbler->id, 'url' => $img['url']],
                array_merge($img, ['produk_id' => $tumbler->id])
            );
        }

        // Spesifikasi Tumbler
        $spesifikasiTumbler = [
            ['kunci' => 'Material', 'nilai' => 'SUS 304 Food Grade Stainless Steel & BPA Free Silicone', 'urutan' => 1],
            ['kunci' => 'Kapasitas', 'nilai' => '900 ml / 32 oz', 'urutan' => 2],
            ['kunci' => 'Retensi Suhu', 'nilai' => 'Dingin hingga 12 jam, Hangat hingga 8 jam', 'urutan' => 3],
            ['kunci' => 'Fitur Tutup', 'nilai' => 'Double-seal leak proof dengan sedotan flip reusable', 'urutan' => 4],
            ['kunci' => 'Bobot Pengiriman', 'nilai' => '600 gram', 'urutan' => 5],
        ];

        foreach ($spesifikasiTumbler as $spec) {
            ProdukSpesifikasi::updateOrCreate(
                ['produk_id' => $tumbler->id, 'kunci' => $spec['kunci']],
                array_merge($spec, ['produk_id' => $tumbler->id])
            );
        }

        // 3. Produk 2: CRSL Cassie Wallet (Sesuai Screenshot 3 & 4)
        $wallet = Produk::updateOrCreate(
            ['slug' => 'crsl-cassie-wallet'],
            [
                'kategori_id'    => 12, // Wallet & Accessories
                'nama'           => 'CRSL Cassie Wallet | Dompet Lipat Canvas Pattern Plaid',
                'deskripsi'      => 'Dompet lipat stylish compact dengan motif tartan plaid khas CRSL. Dibuat dari material canvas poly-cotton premium yang kokoh, dilengkapi 6 slot kartu, 1 kantong koin beresleting aman, dan slot uang kertas luas. Ringkas di saku maupun slingbag.',
                'harga_dasar'    => 199000,
                'harga_diskon'   => 199000,
                'stok_total'     => 75,
                'berat_gram'     => 200,
                'gambar_utama'   => '/assets/gambar/crsl-cassie-wallet-main.jpg',
                'aktif'          => true,
                'is_best_seller' => true,
            ]
        );

        // Varian Cassie Wallet (Heather, Black/Blue Plaid)
        $varianWallet = [
            [
                'sku'           => 'CRSL-WLT-CASSIE-HTH',
                'nama_varian'   => 'Heather Pink Plaid',
                'tipe_varian'   => 'warna',
                'warna'         => 'Heather',
                'warna_hex'     => '#E0A8B8',
                'ukuran'        => 'One Size',
                'harga_tambahan'=> 0,
                'stok'          => 40,
                'gambar_varian' => '/assets/gambar/crsl-cassie-wallet-gallery-1.jpg',
                'aktif'         => true,
            ],
            [
                'sku'           => 'CRSL-WLT-CASSIE-BLP',
                'nama_varian'   => 'Black / Blue Plaid',
                'tipe_varian'   => 'warna',
                'warna'         => 'Black/Blue Plaid',
                'warna_hex'     => '#203A43',
                'ukuran'        => 'One Size',
                'harga_tambahan'=> 0,
                'stok'          => 35,
                'gambar_varian' => '/assets/gambar/crsl-cassie-wallet-gallery-2.jpg',
                'aktif'         => true,
            ],
        ];

        foreach ($varianWallet as $v) {
            ProdukVarian::updateOrCreate(
                ['produk_id' => $wallet->id, 'sku' => $v['sku']],
                array_merge($v, ['produk_id' => $wallet->id])
            );
        }

        // Galeri Gambar Cassie Wallet (crsl-cassie-wallet-gallery-1 sampai 5)
        $gambarWallet = [
            ['url' => '/assets/gambar/crsl-cassie-wallet-gallery-1.jpg', 'alt_teks' => 'CRSL Cassie Wallet Heather Plaid', 'urutan' => 1],
            ['url' => '/assets/gambar/crsl-cassie-wallet-gallery-2.jpg', 'alt_teks' => 'CRSL Cassie Wallet Black Blue Plaid', 'urutan' => 2],
            ['url' => '/assets/gambar/crsl-cassie-wallet-gallery-3.jpg', 'alt_teks' => 'CRSL Cassie Wallet Detail Resleting Koin', 'urutan' => 3],
            ['url' => '/assets/gambar/crsl-cassie-wallet-gallery-4.jpg', 'alt_teks' => 'CRSL Cassie Wallet Slot Kartu Terbuka', 'urutan' => 4],
            ['url' => '/assets/gambar/crsl-cassie-wallet-gallery-5.jpg', 'alt_teks' => 'CRSL Cassie Wallet Tampak Belakang', 'urutan' => 5],
        ];

        foreach ($gambarWallet as $img) {
            GambarProduk::updateOrCreate(
                ['produk_id' => $wallet->id, 'url' => $img['url']],
                array_merge($img, ['produk_id' => $wallet->id])
            );
        }

        // Spesifikasi Cassie Wallet
        $spesifikasiWallet = [
            ['kunci' => 'Material', 'nilai' => 'Canvas Poly-Cotton & Tartan Plaid Inner Lining', 'urutan' => 1],
            ['kunci' => 'Dimensi', 'nilai' => '11.5 cm x 9.5 cm x 2.2 cm', 'urutan' => 2],
            ['kunci' => 'Kompartemen', 'nilai' => '6 Slot Kartu, 1 Slot Uang Kertas, 1 Kantong Koin YKK Resleting', 'urutan' => 3],
            ['kunci' => 'Bobot Pengiriman', 'nilai' => '200 gram', 'urutan' => 4],
        ];

        foreach ($spesifikasiWallet as $spec) {
            ProdukSpesifikasi::updateOrCreate(
                ['produk_id' => $wallet->id, 'kunci' => $spec['kunci']],
                array_merge($spec, ['produk_id' => $wallet->id])
            );
        }

        if (\Illuminate\Support\Facades\DB::connection()->getDriverName() === 'pgsql') {
            $tabelList = ['kategori', 'tier_loyalitas', 'voucher', 'produk', 'produk_varian', 'produk_spesifikasi', 'gambar_produk'];
            foreach ($tabelList as $tabel) {
                \Illuminate\Support\Facades\DB::statement("SELECT setval(pg_get_serial_sequence('\"{$tabel}\"', 'id'), coalesce(max(id), 1)) FROM \"{$tabel}\"");
            }
        }
    }
}
