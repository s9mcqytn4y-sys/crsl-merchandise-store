<?php

namespace Database\Factories;

use App\Models\ItemKeranjang;
use App\Models\Keranjang;
use App\Models\Produk;
use App\Models\ProdukVarian;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ItemKeranjang>
 */
class ItemKeranjangFactory extends Factory
{
    protected $model = ItemKeranjang::class;

    public function definition(): array
    {
        return [
            'keranjang_id' => Keranjang::factory(),
            'produk_id' => Produk::factory(),
            'produk_varian_id' => ProdukVarian::factory(),
            'jumlah' => fake()->numberBetween(1, 3),
        ];
    }
}
