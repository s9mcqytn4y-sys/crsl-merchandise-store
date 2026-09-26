<?php

namespace Database\Factories;

use App\Models\Kategori;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Kategori>
 */
class KategoriFactory extends Factory
{
    protected $model = Kategori::class;

    public function definition(): array
    {
        $nama = fake()->unique()->words(2, true);
        return [
            'nama' => ucfirst($nama),
            'slug' => Str::slug($nama),
            'deskripsi' => fake()->sentence(),
            'emoji' => fake()->randomElement(['🎒', '🔥', '👕', '🧢', '💼', '👟', '✨']),
            'urutan' => fake()->numberBetween(1, 20),
            'aktif' => true,
        ];
    }
}
