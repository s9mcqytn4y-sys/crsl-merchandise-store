<?php

namespace Database\Seeders;

use App\Models\AlamatPengguna;
use App\Models\PenggunaLoyalitas;
use App\Models\Produk;
use App\Models\User;
use App\Models\WilayahIndonesia;
use App\Models\Wishlist;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

        // 2. Hub Pengiriman & Wilayah Indonesia Utama
        $wilayahList = [
            [
                'provinsi' => 'D.I. Yogyakarta',
                'kota' => 'Sleman',
                'tipe' => 'Kabupaten',
                'kecamatan' => 'Depok',
                'kelurahan' => 'Caturtunggal',
                'kode_pos' => '55281',
                'biteship_area_id' => 'IDNP10KAB552810',
            ],
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

        // 3. Pembersihan Transaksi, Keranjang & Akun Non-Abdul (Clean Slate Environment)
        DB::table('item_pesanan')->delete();
        DB::table('pesanan_pengiriman')->delete();
        DB::table('pesanan_pembayaran')->delete();
        DB::table('pesanan')->delete();
        DB::table('item_keranjang')->delete();
        DB::table('keranjang')->delete();
        DB::table('pesan_produk')->delete();

        User::where('email', '!=', 'abdul@crsl-store.id')->delete();

        // 4. Akun Tunggal Terverifikasi: abdul@crsl-store.id
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

        // 5. Profil Loyalitas Abdul (Tier Best Freen)
        PenggunaLoyalitas::updateOrCreate(
            ['pengguna_id' => $user->id],
            [
                'tier_id' => 3, // Best Freen
                'total_belanja' => 750000,
                'poin' => 500,
            ]
        );

        // 6. Buku Alamat Lengkap Abdul (Utama, Kantor Studio, Workshop)
        AlamatPengguna::where('pengguna_id', $user->id)->delete();

        AlamatPengguna::create([
            'pengguna_id' => $user->id,
            'label' => 'Rumah',
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
        ]);

        AlamatPengguna::create([
            'pengguna_id' => $user->id,
            'label' => 'Kantor Studio Sleman',
            'nama_penerima' => 'abdul music (Studio CRSL)',
            'telepon' => '+628567060477',
            'email' => 'abdul@crsl-store.id',
            'negara' => 'Indonesia',
            'provinsi' => 'D.I. Yogyakarta',
            'kota' => 'Sleman',
            'kecamatan' => 'Depok',
            'kelurahan' => 'Caturtunggal',
            'kode_pos' => '55281',
            'alamat_lengkap' => 'Ruko Plaza Gejayan Blok B-3, Jl. Afandi No. 12',
            'rt_rw' => '001/001',
            'no_rumah' => 'B-3',
            'patokan' => 'Dekat Kampus Sanata Dharma',
            'area_id' => 'IDNP10KAB552810',
            'adalah_utama' => false,
        ]);

        AlamatPengguna::create([
            'pengguna_id' => $user->id,
            'label' => 'Workshop Surabaya',
            'nama_penerima' => 'abdul music (Surabaya Hub)',
            'telepon' => '+628567060477',
            'email' => 'abdul@crsl-store.id',
            'negara' => 'Indonesia',
            'provinsi' => 'Jawa Timur',
            'kota' => 'Surabaya',
            'kecamatan' => 'Wonokromo',
            'kelurahan' => 'Darmo',
            'kode_pos' => '60241',
            'alamat_lengkap' => 'Jl. Raya Darmo No. 88, Wonokromo',
            'rt_rw' => '002/004',
            'no_rumah' => '88',
            'patokan' => 'Dekat Taman Bungkul',
            'area_id' => 'IDNP15KOT602410',
            'adalah_utama' => false,
        ]);

        // 7. Wishlist Produk Favorit Abdul
        Wishlist::where('pengguna_id', $user->id)->delete();
        $wishlistProducts = Produk::whereIn('slug', [
            'crsl-drinke-tumblr-series',
            'crsl-cassie-wallet',
        ])->get();

        foreach ($wishlistProducts as $p) {
            Wishlist::create([
                'pengguna_id' => $user->id,
                'produk_id' => $p->id,
            ]);
        }

        // 8. Sinkronisasi PostgreSQL Sequences
        if (DB::connection()->getDriverName() === 'pgsql') {
            $tabelList = [
                'users', 'kategori', 'tier_loyalitas', 'pengguna_loyalitas',
                'voucher', 'voucher_terpakai', 'wilayah_indonesia', 'alamat_pengguna',
                'produk', 'produk_varian', 'produk_spesifikasi', 'gambar_produk',
                'pesanan_pengiriman', 'pesanan_pembayaran', 'item_pesanan',
                'wishlist', 'pesan_produk', 'keranjang', 'item_keranjang',
            ];
            foreach ($tabelList as $tabel) {
                DB::statement("SELECT setval(pg_get_serial_sequence('\"{$tabel}\"', 'id'), coalesce(max(id), 1)) FROM \"{$tabel}\"");
            }
        }
    }
}
