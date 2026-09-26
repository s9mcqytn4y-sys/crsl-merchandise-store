<?php

namespace Database\Factories;

use App\Models\Kategori;
use App\Models\Produk;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Produk>
 */
class ProdukFactory extends Factory
{
    protected $model = Produk::class;

    public function definition(): array
    {
        $nama = fake()->unique()->words(4, true);
        $hargaDasar = fake()->randomElement([149000, 199000, 249000, 289000, 329000, 399000]);
        $hasDiskon = fake()->boolean(60);

        return [
            'kategori_id' => Kategori::factory(),
            'nama' => ucwords($nama),
            'slug' => Str::slug($nama) . '-' . fake()->unique()->randomNumber(4),
            'deskripsi' => fake()->paragraph(3),
            'harga_dasar' => $hargaDasar,
            'harga_diskon' => $hasDiskon ? ($hargaDasar - 20000) : null,
            'stok_total' => fake()->numberBetween(10, 200),
            'berat_gram' => fake()->randomElement([200, 350, 500, 600, 800]),
            'tipe_produk' => 'regular',
            'estimasi_po' => null,
            'status_stok' => 'in_stock',
            'terjual' => fake()->numberBetween(0, 500),
            'is_best_seller' => fake()->boolean(20),
            'gambar_utama' => '/assets/gambar/drinke-tumblr.webp',
            'aktif' => true,
        ];
    }
}
