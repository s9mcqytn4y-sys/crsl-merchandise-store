<?php

namespace Database\Factories;

use App\Models\TierLoyalitas;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TierLoyalitas>
 */
class TierLoyalitasFactory extends Factory
{
    protected $model = TierLoyalitas::class;

    public function definition(): array
    {
        $nama = fake()->unique()->randomElement(['New Freen', 'Good Freen', 'Best Freen', 'CRSL VIP']);
        return [
            'nama' => $nama,
            'slug' => Str::slug($nama),
            'syarat_belanja' => fake()->randomElement([0, 200000, 500000, 1000000]),
            'durasi_bulan' => 12,
            'bonus_poin_masuk' => fake()->randomElement([100, 300, 500, 1000]),
            'poin_per_ulasan' => 200,
            'warna_aksen' => fake()->randomElement(['#3b82f6', '#10b981', '#e52027', '#8b5cf6']),
            'urutan' => fake()->numberBetween(1, 5),
        ];
    }
}
