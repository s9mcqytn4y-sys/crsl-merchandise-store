<?php

namespace Database\Factories;

use App\Models\PesanProduk;
use App\Models\Produk;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PesanProduk>
 */
class PesanProdukFactory extends Factory
{
    protected $model = PesanProduk::class;

    public function definition(): array
    {
        return [
            'pengguna_id' => User::factory(),
            'produk_id' => Produk::factory(),
            'nama_produk' => fake()->words(3, true),
            'varian' => fake()->randomElement(['Black - L', 'White - M', 'Grey - All Size']),
            'pesan' => fake()->sentence(),
        ];
    }
}
