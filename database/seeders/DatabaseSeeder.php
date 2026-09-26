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
        $this->call([
            MerchandiseSeeder::class,
            ProdukResmiSeeder::class,
        ]);

        $user = User::updateOrCreate(
            ['email' => 'abdul@crsl-store.id'],
            [
                'name' => 'abdul music',
                'telepon' => '+628567060477',
                'password' => bcrypt('password123'),
                'birth_day' => '14',
                'birth_month' => '09',
                'birth_year' => '2003',
                'email_verified_at' => now(),
            ]
        );

        // Seed Loyalitas untuk user (Good Freen)
        \App\Models\PenggunaLoyalitas::updateOrCreate(
            ['pengguna_id' => $user->id],
            [
                'tier_id' => 2,
                'total_belanja' => 289000,
                'poin' => 50,
            ]
        );

        // Seed Akun Testing Khusus
        $tester = User::updateOrCreate(
            ['email' => 'tester@crsl-store.id'],
            [
                'name' => 'Tester CRSL',
                'telepon' => '081234567890',
                'password' => bcrypt('password123'),
                'birth_day' => '01',
                'birth_month' => '01',
                'birth_year' => '2000',
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

        // Seed Alamat untuk user (sesuai profil pengguna)
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
                'area_id' => 'IDNP11KOT789311',
                'adalah_utama' => true,
            ]
        );

        // Ambil produk dan varian tumbler yang valid
        $tumblerProduk = \App\Models\Produk::where('slug', 'crsl-drinke-tumblr-series')
            ->orWhere('id', 7)
            ->first();
        $tumblerVarian = $tumblerProduk ? \App\Models\ProdukVarian::where('produk_id', $tumblerProduk->id)->first() : null;

        // Seed Pesanan #TLTEY3004 (Cancelled / Dibatalkan)
        $pesanan = \App\Models\Pesanan::firstOrCreate(
            ['nomor_pesanan' => 'TLTEY3004'],
            [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'pengguna_id' => $user->id,
                'status' => 'dibatalkan',
                'subtotal' => 289000,
                'ongkir' => 0,
                'biaya_asuransi' => 0,
                'diskon' => 0,
                'total' => 289000,
                'mata_uang' => 'IDR',
                'catatan' => 'Pesanan dari website CRSL Official Store',
                'created_at' => '2026-09-23 10:00:00',
            ]
        );

        \App\Models\ItemPesanan::firstOrCreate(
            ['pesanan_id' => $pesanan->id],
            [
                'produk_id' => $tumblerProduk?->id,
                'produk_varian_id' => $tumblerVarian?->id,
                'nama_produk' => 'CRSL Drinke Tumblr Series | Botol Tempat Minum Stainless 900ml',
                'sku' => $tumblerVarian?->sku ?? 'CRSL-TMB-DRN-32-CHOCO',
                'harga' => 289000,
                'jumlah' => 1,
                'warna' => 'DARK GREY',
                'ukuran' => '900ml / 32oz',
                'gambar' => '/assets/gambar/drinke-tumblr.webp',
            ]
        );

        \App\Models\PesananPengiriman::firstOrCreate(
            ['pesanan_id' => $pesanan->id],
            [
                'kurir' => 'jne',
                'layanan' => 'Reguler',
                'nomor_resi' => 'JNE-MOCK-20260923-001',
                'biteship_order_id' => 'BS-MOCK-20260923-001',
                'tracking_status' => 'cancelled',
                'json_payload' => [
                    'nama_penerima' => 'abdul music',
                    'telepon' => '+628567060477',
                    'alamat_lengkap' => 'Jakarta Pusat, Johar Baru, johar baru johar baru',
                    'kota' => 'Jakarta Pusat',
                    'provinsi' => 'DKI Jakarta',
                ],
            ]
        );

        \App\Models\PesananPembayaran::firstOrCreate(
            ['pesanan_id' => $pesanan->id],
            [
                'metode_bayar' => 'BCA Virtual Account',
                'midtrans_id' => 'TRX-MOCK-20260923-001',
                'midtrans_status' => 'cancel',
                'nomor_va' => '8077708567060477',
                'waktu_kedaluwarsa' => '2026-09-24 10:00:00',
                'instruksi_bayar' => [
                    'Buka BCA Mobile > m-Transfer > BCA Virtual Account',
                    'Masukkan nomor Virtual Account: 8077708567060477',
                    'Konfirmasi tagihan sebesar Rp 289.000',
                ],
            ]
        );
    }
}
