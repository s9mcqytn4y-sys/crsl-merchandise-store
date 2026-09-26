<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherTerpakai;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<VoucherTerpakai>
 */
class VoucherTerpakaiFactory extends Factory
{
    protected $model = VoucherTerpakai::class;

    public function definition(): array
    {
        return [
            'voucher_id' => Voucher::factory(),
            'pengguna_id' => User::factory(),
            'pesanan_id' => (string) Str::uuid(),
            'dipakai_pada' => now(),
        ];
    }
}
