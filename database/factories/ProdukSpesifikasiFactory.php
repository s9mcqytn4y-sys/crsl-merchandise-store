<?php

namespace Database\Factories;

use App\Models\Produk;
use App\Models\ProdukSpesifikasi;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProdukSpesifikasi>
 */
class ProdukSpesifikasiFactory extends Factory
{
    protected $model = ProdukSpesifikasi::class;

    public function definition(): array
    {
        return [
            'produk_id' => Produk::factory(),
            'kunci' => fake()->randomElement(['Bahan', 'Dimensi', 'Kapasitas', 'Fitur', 'Perawatan']),
            'nilai' => fake()->words(3, true),
            'urutan' => fake()->numberBetween(1, 10),
        ];
    }
}
