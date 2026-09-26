<?php

namespace Database\Factories;

use App\Models\GambarProduk;
use App\Models\Produk;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GambarProduk>
 */
class GambarProdukFactory extends Factory
{
    protected $model = GambarProduk::class;

    public function definition(): array
    {
        return [
            'produk_id' => Produk::factory(),
            'url' => fake()->randomElement([
                '/assets/gambar/drinke-tumblr.webp',
                '/assets/gambar/banner-bts.webp',
                '/assets/gambar/banner-tumbler.webp',
                '/assets/gambar/hero-banner.webp',
            ]),
            'alt_teks' => fake()->words(3, true),
            'urutan' => fake()->numberBetween(1, 5),
        ];
    }
}
