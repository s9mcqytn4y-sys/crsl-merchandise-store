<?php

namespace Database\Factories;

use App\Models\Pesanan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Pesanan>
 */
class PesananFactory extends Factory
{
    protected $model = Pesanan::class;

    public function definition(): array
    {
        $subtotal = fake()->randomElement([149000, 289000, 420000, 560000]);
        $ongkir = fake()->randomElement([12000, 18000, 24000]);
        $biayaAsuransi = 1500;
        $diskon = fake()->randomElement([0, 15000, 25000]);
        $total = $subtotal + $ongkir + $biayaAsuransi - $diskon;

        return [
            'id' => (string) Str::uuid(),
            'nomor_pesanan' => 'INV/CRSL/' . date('Ymd') . '/' . fake()->unique()->numerify('####'),
            'pengguna_id' => User::factory(),
            'status' => fake()->randomElement(['belum_bayar', 'akan_dikirim', 'dikirim', 'selesai', 'dibatalkan']),
            'subtotal' => $subtotal,
            'ongkir' => $ongkir,
            'biaya_asuransi' => $biayaAsuransi,
            'diskon' => $diskon,
            'total' => $total,
            'mata_uang' => 'IDR',
            'catatan' => 'Pesanan resmi CRSL Store',
            'kode_voucher' => $diskon > 0 ? 'CRSLPROMO' : null,
            'poin_digunakan' => 0,
            'poin_didapat' => (int) ($subtotal / 1000),
            'is_dropship' => false,
            'dropship_pengirim' => null,
            'dropship_telepon' => null,
        ];
    }
}
