<?php

namespace Database\Factories;

use App\Models\Keranjang;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Keranjang>
 */
class KeranjangFactory extends Factory
{
    protected $model = Keranjang::class;

    public function definition(): array
    {
        return [
            'pengguna_id' => User::factory(),
            'session_id' => Str::random(40),
        ];
    }
}
