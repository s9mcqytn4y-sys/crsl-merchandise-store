<?php

namespace Database\Factories;

use App\Models\Produk;
use App\Models\ProdukVarian;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProdukVarian>
 */
class ProdukVarianFactory extends Factory
{
    protected $model = ProdukVarian::class;

    public function definition(): array
    {
        $warna = fake()->randomElement(['Hitam', 'Putih', 'Navy', 'Dark Grey', 'Dusty Pink', 'Olive']);
        $ukuran = fake()->randomElement(['S', 'M', 'L', 'XL', 'All Size', '900ml / 32oz']);

        return [
            'produk_id' => Produk::factory(),
            'sku' => 'CRSL-' . strtoupper(Str::random(5)) . '-' . fake()->unique()->randomNumber(4),
            'nama_varian' => $warna . ' - ' . $ukuran,
            'tipe_varian' => 'warna',
            'warna' => $warna,
            'warna_hex' => fake()->hexColor(),
            'warna_gambar' => null,
            'ukuran' => $ukuran,
            'harga_tambahan' => 0,
            'stok' => fake()->numberBetween(5, 50),
            'gambar_varian' => '/assets/gambar/drinke-tumblr.webp',
            'aktif' => true,
        ];
    }
}
