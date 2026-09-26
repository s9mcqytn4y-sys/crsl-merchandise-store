<?php

namespace Database\Seeders;

use App\Models\AlamatPengguna;
use App\Models\GambarProduk;
use App\Models\ItemKeranjang;
use App\Models\ItemPesanan;
use App\Models\Kategori;
use App\Models\Keranjang;
use App\Models\PenggunaLoyalitas;
use App\Models\PesanProduk;
use App\Models\Pesanan;
use App\Models\PesananPembayaran;
use App\Models\PesananPengiriman;
use App\Models\Produk;
use App\Models\ProdukVarian;
use App\Models\TierLoyalitas;
use App\Models\User;
use App\Models\Voucher;
use App\Models\WilayahIndonesia;
use App\Models\Wishlist;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Master Merchandise & Produk Resmi
        $this->call([
            MerchandiseSeeder::class,
            ProdukResmiSeeder::class,
        ]);

        // 2. Tambahan Wilayah Indonesia (Hub Pengiriman Utama)
        $wilayahList = [
            [
                'provinsi' => 'DKI Jakarta',
                'kota' => 'Jakarta Pusat',
                'tipe' => 'Kota',
                'kecamatan' => 'Johar Baru',
                'kelurahan' => 'Johar Baru',
                'kode_pos' => '10560',
                'biteship_area_id' => 'IDNP11KOT789311',
            ],
            [
                'provinsi' => 'DKI Jakarta',
                'kota' => 'Jakarta Selatan',
                'tipe' => 'Kota',
                'kecamatan' => 'Tebet',
                'kelurahan' => 'Tebet Barat',
                'kode_pos' => '12810',
                'biteship_area_id' => 'IDNP11KOT128100',
            ],
            [
                'provinsi' => 'Jawa Barat',
                'kota' => 'Bandung',
                'tipe' => 'Kota',
                'kecamatan' => 'Coblong',
                'kelurahan' => 'Dago',
                'kode_pos' => '40135',
                'biteship_area_id' => 'IDNP12KOT401350',
            ],
            [
                'provinsi' => 'Jawa Timur',
                'kota' => 'Surabaya',
                'tipe' => 'Kota',
                'kecamatan' => 'Wonokromo',
                'kelurahan' => 'Darmo',
                'kode_pos' => '60241',
                'biteship_area_id' => 'IDNP15KOT602410',
            ],
        ];

        foreach ($wilayahList as $w) {
            WilayahIndonesia::updateOrCreate(['kode_pos' => $w['kode_pos']], $w);
        }

        // 3. User Utama (Abdul)
        $user = User::updateOrCreate(
            ['email' => 'abdul@crsl-store.id'],
            [
                'name' => 'abdul music',
                'telepon' => '+628567060477',
                'password' => Hash::make('password123'),
                'birth_day' => '14',
                'birth_month' => '09',
                'birth_year' => '2003',
                'email_verified_at' => now(),
            ]
        );

        PenggunaLoyalitas::updateOrCreate(
            ['pengguna_id' => $user->id],
            [
                'tier_id' => 2, // Good Freen
                'total_belanja' => 578000,
                'poin' => 150,
            ]
        );

        // Alamat Utama & Sekunder Abdul
        AlamatPengguna::updateOrCreate(
            ['pengguna_id' => $user->id, 'label' => 'Rumah'],
            [
                'nama_penerima' => 'abdul music',
                'telepon' => '+628567060477',
                'email' => 'abdul@crsl-store.id',
                'negara' => 'Indonesia',
                'provinsi' => 'DKI Jakarta',
                'kota' => 'Jakarta Pusat',
                'kecamatan' => 'Johar Baru',
                'kelurahan' => 'Johar Baru',
                'kode_pos' => '10560',
                'alamat_lengkap' => 'Jl. Percetakan Negara No. 42, RT 003/RW 005',
                'rt_rw' => '003/005',
                'no_rumah' => '42',
                'patokan' => 'Samping Apotek K-24',
                'area_id' => 'IDNP11KOT789311',
                'adalah_utama' => true,
            ]
        );

        AlamatPengguna::updateOrCreate(
            ['pengguna_id' => $user->id, 'label' => 'Kantor Studio'],
            [
                'nama_penerima' => 'abdul music (Studio)',
                'telepon' => '+628567060477',
                'email' => 'abdul@crsl-store.id',
                'negara' => 'Indonesia',
                'provinsi' => 'D.I. Yogyakarta',
                'kota' => 'Sleman',
                'kecamatan' => 'Depok',
                'kelurahan' => 'Caturtunggal',
                'kode_pos' => '55281',
                'alamat_lengkap' => 'Ruko Plaza Gejayan Blok B-3, Jl. Afandi',
                'rt_rw' => '001/001',
                'no_rumah' => 'B-3',
                'patokan' => 'Depan Kampus Sanata Dharma',
                'area_id' => 'IDNP11KOT789311',
                'adalah_utama' => false,
            ]
        );

        // 4. User Testing Khusus & Admin
        $tester = User::updateOrCreate(
            ['email' => 'tester@crsl-store.id'],
            [
                'name' => 'Tester CRSL',
                'telepon' => '081234567890',
                'password' => Hash::make('password123'),
                'birth_day' => '01',
                'birth_month' => '01',
                'birth_year' => '2000',
                'email_verified_at' => now(),
            ]
        );

        PenggunaLoyalitas::updateOrCreate(
            ['pengguna_id' => $tester->id],
            [
                'tier_id' => 1,
                'total_belanja' => 250000,
                'poin' => 250,
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@crsl-store.id'],
            [
                'name' => 'Admin CRSL Official',
                'telepon' => '081122334455',
                'password' => Hash::make('password123'),
                'birth_day' => '10',
                'birth_month' => '10',
                'birth_year' => '1998',
                'email_verified_at' => now(),
            ]
        );

        // 5. Produk Referensi
        $tumbler = Produk::where('slug', 'crsl-drinke-tumblr-series')->orWhere('id', 7)->first();
        $tumblerVarian = $tumbler ? ProdukVarian::where('produk_id', $tumbler->id)->first() : null;

        $wallet = Produk::where('slug', 'crsl-cassie-wallet')->orWhere('id', 1)->first();
        $walletVarian = $wallet ? ProdukVarian::where('produk_id', $wallet->id)->first() : null;

        // 6. Seed Wishlist
        if ($tumbler && $user) {
            Wishlist::firstOrCreate([
                'pengguna_id' => $user->id,
                'produk_id' => $tumbler->id,
            ]);
        }
        if ($wallet && $user) {
            Wishlist::firstOrCreate([
                'pengguna_id' => $user->id,
                'produk_id' => $wallet->id,
            ]);
        }

        // 7. Seed Keranjang Belanja User
        if ($user && $wallet && $walletVarian) {
            $keranjang = Keranjang::firstOrCreate(
                ['pengguna_id' => $user->id],
                ['session_id' => Str::random(40)]
            );

            ItemKeranjang::firstOrCreate(
                [
                    'keranjang_id' => $keranjang->id,
                    'produk_id' => $wallet->id,
                    'produk_varian_id' => $walletVarian->id,
                ],
                ['jumlah' => 1]
            );
        }

        // 8. Seed Pesan Diskusi Produk
        if ($tumbler && $user) {
            PesanProduk::firstOrCreate(
                [
                    'pengguna_id' => $user->id,
                    'produk_id' => $tumbler->id,
                    'varian' => 'Dark Grey - 900ml',
                ],
                [
                    'nama_produk' => $tumbler->nama,
                    'pesan' => 'Apakah varian Dark Grey ready stock untuk dikirim hari ini?',
                ]
            );
        }

        // 9. Pesanan 1: INV/CRSL/20260926/0001 (Belum Bayar - QRIS & VA Active Testing)
        $pesananAktif = Pesanan::firstOrCreate(
            ['nomor_pesanan' => 'INV/CRSL/20260926/0001'],
            [
                'id' => (string) Str::uuid(),
                'pengguna_id' => $user->id,
                'status' => 'belum_bayar',
                'subtotal' => 289000,
                'ongkir' => 15000,
                'biaya_asuransi' => 1500,
                'diskon' => 25000,
                'total' => 280500,
                'mata_uang' => 'IDR',
                'catatan' => 'Tolong bubble wrap ekstra ya',
                'kode_voucher' => 'CRSLYAY25',
                'poin_digunakan' => 0,
                'poin_didapat' => 280,
                'is_dropship' => false,
                'created_at' => now(),
            ]
        );

        ItemPesanan::firstOrCreate(
            ['pesanan_id' => $pesananAktif->id],
            [
                'produk_id' => $tumbler?->id,
                'produk_varian_id' => $tumblerVarian?->id,
                'nama_produk' => $tumbler?->nama ?? 'CRSL Drinke Tumblr Series 900ml',
                'sku' => $tumblerVarian?->sku ?? 'CRSL-TMB-DRN-32-CHOCO',
                'harga' => 289000,
                'jumlah' => 1,
                'warna' => 'DARK GREY',
                'ukuran' => '900ml / 32oz',
                'gambar' => '/assets/gambar/drinke-tumblr.webp',
            ]
        );

        PesananPengiriman::firstOrCreate(
            ['pesanan_id' => $pesananAktif->id],
            [
                'kurir' => 'jne',
                'layanan' => 'Reguler',
                'nomor_resi' => null,
                'biteship_order_id' => null,
                'tracking_status' => 'allocated',
                'json_payload' => [
                    'nama_penerima' => 'abdul music',
                    'telepon' => '+628567060477',
                    'alamat_lengkap' => 'Jl. Percetakan Negara No. 42, Jakarta Pusat',
                    'kota' => 'Jakarta Pusat',
                    'provinsi' => 'DKI Jakarta',
                    'kode_pos' => '10560',
                ],
            ]
        );

        PesananPembayaran::firstOrCreate(
            ['pesanan_id' => $pesananAktif->id],
            [
                'metode_bayar' => 'BCA Virtual Account',
                'midtrans_id' => 'CRSL-PAY-' . date('Ymd') . '-0001',
                'midtrans_status' => 'pending',
                'nomor_va' => '8077708567060477',
                'kode_biller' => null,
                'qr_string' => '00020101021226680016ID.CO.SHOPEE.WWW011893600918000000000002150000000000000000303UMI51440014ID.CO.QRIS.WWW0215ID10200000000000303UMI5204541153033605802ID5910CRSL STORE6007JAKARTA61051056062070703A016304',
                'qr_code_url' => 'https://api.sandbox.midtrans.com/v2/qris/mock/qr-code',
                'waktu_kedaluwarsa' => now()->addDay(),
                'waktu_bayar' => null,
                'instruksi_bayar' => [
                    'Buka BCA Mobile > m-Transfer > BCA Virtual Account',
                    'Masukkan nomor Virtual Account: 8077708567060477',
                    'Konfirmasi tagihan sebesar Rp 280.500',
                    'Masukkan PIN m-BCA dan simpan bukti pembayaran',
                ],
                'payment_payload' => [
                    'payment_type' => 'bank_transfer',
                    'va_numbers' => [['bank' => 'bca', 'va_number' => '8077708567060477']],
                ],
            ]
        );

        // 10. Pesanan 2: INV/CRSL/20260920/0042 (Selesai)
        $pesananSelesai = Pesanan::firstOrCreate(
            ['nomor_pesanan' => 'INV/CRSL/20260920/0042'],
            [
                'id' => (string) Str::uuid(),
                'pengguna_id' => $user->id,
                'status' => 'selesai',
                'subtotal' => 199000,
                'ongkir' => 12000,
                'biaya_asuransi' => 1000,
                'diskon' => 0,
                'total' => 212000,
                'mata_uang' => 'IDR',
                'catatan' => 'Barang sudah diterima dengan sangat baik',
                'created_at' => now()->subDays(6),
            ]
        );

        ItemPesanan::firstOrCreate(
            ['pesanan_id' => $pesananSelesai->id],
            [
                'produk_id' => $wallet?->id,
                'produk_varian_id' => $walletVarian?->id,
                'nama_produk' => $wallet?->nama ?? 'CRSL Cassie Wallet Plaid',
                'sku' => $walletVarian?->sku ?? 'CRSL-WLT-CASSIE-PNK',
                'harga' => 199000,
                'jumlah' => 1,
                'warna' => 'CHILO PINK',
                'ukuran' => 'All Size',
                'gambar' => '/assets/gambar/cassie-wallet.webp',
            ]
        );

        PesananPengiriman::firstOrCreate(
            ['pesanan_id' => $pesananSelesai->id],
            [
                'kurir' => 'sicepat',
                'layanan' => 'SIUNT',
                'nomor_resi' => '004128931201',
                'biteship_order_id' => 'BS-20260920-0042',
                'tracking_status' => 'delivered',
                'json_payload' => [
                    'status' => 'delivered',
                    'history' => [
                        ['note' => 'Pesanan telah diterima oleh YBS (Abdul)', 'updated_at' => now()->subDays(4)->toIso8601String()],
                        ['note' => 'Paket dibawa kurir untuk diantar ke alamat tujuan', 'updated_at' => now()->subDays(5)->toIso8601String()],
                        ['note' => 'Paket tiba di sorting hub Jakarta Pusat', 'updated_at' => now()->subDays(5)->toIso8601String()],
                    ],
                ],
            ]
        );

        PesananPembayaran::firstOrCreate(
            ['pesanan_id' => $pesananSelesai->id],
            [
                'metode_bayar' => 'GoPay / QRIS',
                'midtrans_id' => 'CRSL-PAY-20260920-0042',
                'midtrans_status' => 'settlement',
                'waktu_bayar' => now()->subDays(6),
                'instruksi_bayar' => ['Pembayaran berhasil via QRIS Midtrans'],
            ]
        );

        // 11. Sinkronisasi Sequences PostgreSQL
        if (DB::connection()->getDriverName() === 'pgsql') {
            $tabelList = [
                'users', 'kategori', 'tier_loyalitas', 'pengguna_loyalitas',
                'voucher', 'voucher_terpakai', 'wilayah_indonesia', 'alamat_pengguna',
                'produk', 'produk_varian', 'produk_spesifikasi', 'gambar_produk',
                'pesanan_pengiriman', 'pesanan_pembayaran', 'item_pesanan',
                'wishlist', 'pesan_produk', 'keranjang', 'item_keranjang'
            ];
            foreach ($tabelList as $tabel) {
                DB::statement("SELECT setval(pg_get_serial_sequence('\"{$tabel}\"', 'id'), coalesce(max(id), 1)) FROM \"{$tabel}\"");
            }
        }
    }
}
