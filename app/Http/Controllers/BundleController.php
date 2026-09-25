<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BundleController extends Controller
{
    protected array $bundleDatabase = [
        3516 => [
            'id' => 3516,
            'judul' => 'BACK TO SCHOOL with Miflo',
            'slug' => 'back-to-school-with-miflo',
            'harga_paket' => 289000,
            'harga_asli' => 343100,
            'diskon_persen' => 15,
            'hemat' => 'Hemat Rp 54.100 (15% OFF)',
            'gambar_utama' => '/assets/gambar/bundle-miflo-cover.webp',
            'galeri' => [
                '/assets/gambar/bundle-miflo-cover.webp',
                '/assets/gambar/bundle-miflo-freebies.webp',
            ],
            'deskripsi' => 'Paket Back to School terlengkap bersama Miflo the Cat! Nikmati ransel mini kanvas water-repellent yang stylish dilengkapi kompartemen lengkap, ditambah gantungan kunci karakter Ropy yang imut dan koleksi stiker BTS 2026 eksklusif.',
            'items' => [
                [
                    'id' => 101,
                    'nama' => 'CRSL Miflo Mini Backpack | Tas Gendong Canvas Wanita',
                    'harga' => 299000,
                    'gambar' => '/assets/gambar/bundle-miflo-cover.webp',
                    'varian' => [
                        ['id' => 1011, 'nama' => 'Pink Pastel', 'hex' => '#ec4899', 'sku' => 'CRSL-BND-MFL-PNK'],
                        ['id' => 1012, 'nama' => 'Black Charcoal', 'hex' => '#1e293b', 'sku' => 'CRSL-BND-MFL-BLK'],
                        ['id' => 1013, 'nama' => 'Sage Green', 'hex' => '#15803d', 'sku' => 'CRSL-BND-MFL-SGE'],
                    ],
                ],
                [
                    'id' => 102,
                    'nama' => 'CRSL Ropy Colorful Keychain | Aksesoris Gantungan Kunci',
                    'harga' => 44100,
                    'gambar' => '/assets/gambar/cassie-wallet.webp',
                    'varian' => [
                        ['id' => 1021, 'nama' => 'Chilo Pink', 'hex' => '#ec4899', 'sku' => 'CRSL-BND-RPY-CHL'],
                        ['id' => 1022, 'nama' => 'Odin Green', 'hex' => '#15803d', 'sku' => 'CRSL-BND-RPY-ODN'],
                        ['id' => 1023, 'nama' => 'Choco Brown', 'hex' => '#78350f', 'sku' => 'CRSL-BND-RPY-CHC'],
                    ],
                ],
            ],
            'freebies' => [
                'Exclusive Sticker Pack BTS 2026',
                'Character Enamel Pin Special Edition',
                'CRSL Authenticity Certificate Card',
            ],
        ],
        2188 => [
            'id' => 2188,
            'judul' => 'BACK TO SCHOOL WITH HARU!',
            'slug' => 'back-to-school-with-haru',
            'harga_paket' => 329000,
            'harga_asli' => 395000,
            'diskon_persen' => 16,
            'hemat' => 'Hemat Rp 66.000 (16% OFF)',
            'gambar_utama' => '/assets/gambar/bundle-haru-cover.webp',
            'galeri' => [
                '/assets/gambar/bundle-haru-cover.webp',
                '/assets/gambar/bundle-haru-freebies.webp',
            ],
            'deskripsi' => 'Paket Back to School edisi spesial Haru! Ransel motif tartan plaid premium bernuansa retro modern dengan kapasitas besar untuk laptop 14 inci, dipadukan dengan set pin badge 5 karakter enamel dan keychain tartan limited edition.',
            'items' => [
                [
                    'id' => 201,
                    'nama' => 'CRSL Haru Tartan Plaid Backpack | Tas Sekolah Premium',
                    'harga' => 345000,
                    'gambar' => '/assets/gambar/bundle-haru-cover.webp',
                    'varian' => [
                        ['id' => 2011, 'nama' => 'Brown Plaid', 'hex' => '#78350f', 'sku' => 'CRSL-BND-HRU-BRN'],
                        ['id' => 2012, 'nama' => 'Blue Plaid', 'hex' => '#3b82f6', 'sku' => 'CRSL-BND-HRU-BLU'],
                        ['id' => 2013, 'nama' => 'Grey Tartan', 'hex' => '#64748b', 'sku' => 'CRSL-BND-HRU-GRY'],
                    ],
                ],
                [
                    'id' => 202,
                    'nama' => 'CRSL Character Pin Badge Set | 5 Karakter Enamel',
                    'harga' => 50000,
                    'gambar' => '/assets/gambar/banner-2.webp',
                    'varian' => [
                        ['id' => 2021, 'nama' => 'Squad 5 Karakter', 'hex' => '#eab308', 'sku' => 'CRSL-BND-PIN-SQD'],
                        ['id' => 2022, 'nama' => 'Duo Besties Edition', 'hex' => '#ec4899', 'sku' => 'CRSL-BND-PIN-DUO'],
                    ],
                ],
            ],
            'freebies' => [
                'Exclusive Hologram Sticker BTS 2026',
                'Keyring Tartan Haru Special Edition',
                'CRSL Authenticity Certificate Card',
            ],
        ],
    ];

    public function show(int $id, ?string $slug = null): Response
    {
        $bundle = $this->bundleDatabase[$id] ?? $this->bundleDatabase[3516];

        $rekomendasi = Produk::with(['kategori', 'varian'])
            ->where('aktif', true)
            ->inRandomOrder()
            ->take(4)
            ->get();

        return Inertia::render('DetailBundle', [
            'bundle' => $bundle,
            'rekomendasi' => $rekomendasi,
        ]);
    }
}
