<?php

namespace Database\Factories;

use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Voucher>
 */
class VoucherFactory extends Factory
{
    protected $model = Voucher::class;

    public function definition(): array
    {
        $tipe = fake()->randomElement(['persen', 'nominal', 'ongkir']);
        $nilai = match ($tipe) {
            'persen' => fake()->randomElement([10, 15, 20, 25]),
            'nominal' => fake()->randomElement([15000, 25000, 50000]),
            'ongkir' => fake()->randomElement([10000, 15000, 20000]),
        };

        return [
            'kode' => 'CRSL' . strtoupper(Str::random(5)),
            'judul' => 'Promo Diskon ' . ($tipe === 'persen' ? $nilai . '%' : 'Rp ' . number_format($nilai, 0, ',', '.')),
            'tipe' => $tipe,
            'nilai' => $nilai,
            'min_belanja' => fake()->randomElement([50000, 100000, 150000]),
            'syarat_kurir' => 'all',
            'kuota' => fake()->numberBetween(100, 1000),
            'berlaku_dari' => now()->subDays(5),
            'berlaku_sampai' => now()->addDays(30),
            'aktif' => true,
        ];
    }
}
