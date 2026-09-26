<?php

namespace Database\Factories;

use App\Models\PenggunaLoyalitas;
use App\Models\TierLoyalitas;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PenggunaLoyalitas>
 */
class PenggunaLoyalitasFactory extends Factory
{
    protected $model = PenggunaLoyalitas::class;

    public function definition(): array
    {
        return [
            'pengguna_id' => User::factory(),
            'tier_id' => TierLoyalitas::factory(),
            'total_belanja' => fake()->numberBetween(50000, 1500000),
            'poin' => fake()->numberBetween(10, 500),
            'diperbarui_pada' => now(),
        ];
    }
}
