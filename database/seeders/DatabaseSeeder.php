<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(MerchandiseSeeder::class);

        $user = User::firstOrCreate(
            ['email' => 'abdul@crsl-store.id'],
            [
                'name' => 'abdul music',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Seed Loyalitas untuk user
        \App\Models\PenggunaLoyalitas::updateOrCreate(
            ['pengguna_id' => $user->id],
            [
                'tier_id' => 1,
                'total_belanja' => 0,
                'poin' => 0,
            ]
        );

        // Seed Akun Testing Khusus
        $tester = User::firstOrCreate(
            ['email' => 'tester@crsl-store.id'],
            [
                'name' => 'Tester CRSL',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ]
        );

        \App\Models\PenggunaLoyalitas::updateOrCreate(
            ['pengguna_id' => $tester->id],
            [
                'tier_id' => 1,
                'total_belanja' => 250000,
                'poin' => 250,
            ]
        );

        // Seed Alamat untuk user (sesuai Screenshot 3 & 5)
        \App\Models\AlamatPengguna::updateOrCreate(
            ['pengguna_id' => $user->id, 'adalah_utama' => true],
            [
                'label' => 'Rumah',
                'nama_penerima' => 'abdul music',
                'telepon' => '+628567060477',
                'provinsi' => 'DKI Jakarta',
                'kota' => 'Jakarta Pusat',
                'kecamatan' => 'Johar Baru',
                'kelurahan' => 'Johar Baru',
                'kode_pos' => '10560',
                'alamat_lengkap' => 'Jakarta Pusat, Johar Baru, johar baru johar baru',
                'adalah_utama' => true,
            ]
        );

        // Seed Pesanan #TLTEY3004 (Cancelled / Dibatalkan) sesuai Screenshot 3
        $pesanan = \App\Models\Pesanan::firstOrCreate(
            ['nomor_pesanan' => 'TLTEY3004'],
            [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'pengguna_id' => $user->id,
                'status' => 'dibatalkan',
                'subtotal' => 289000,
                'ongkir' => 0,
                'biaya_asuransi' => 0,
                'diskon' => 50000,
                'total' => 289000,
                'mata_uang' => 'IDR',
                'catatan' => 'Pesanan dari checkout website',
                'created_at' => '2026-09-23 10:00:00',
            ]
        );

        \App\Models\ItemPesanan::firstOrCreate(
            ['pesanan_id' => $pesanan->id, 'nama_produk' => 'CRSL Drinke Tumblr Series | Botol Tempat minum | Tumbler | Tumbler Travel Bottle Stainless 900ml 32oz'],
            [
                'produk_id' => 7,
                'produk_varian_id' => 7,
                'sku' => 'CRSL-TMB-DRN-32-CHOCO',
                'harga' => 289000,
                'jumlah' => 1,
                'warna' => 'DARK GREY',
                'ukuran' => '900ml / 32oz',
                'gambar' => '/assets/gambar/drinke-tumblr.webp',
            ]
        );
    }
}
