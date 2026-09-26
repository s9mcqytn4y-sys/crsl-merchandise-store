<?php

namespace Database\Factories;

use App\Models\WilayahIndonesia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WilayahIndonesia>
 */
class WilayahIndonesiaFactory extends Factory
{
    protected $model = WilayahIndonesia::class;

    public function definition(): array
    {
        return [
            'provinsi' => 'DKI Jakarta',
            'kota' => 'Jakarta Selatan',
            'tipe' => 'Kota',
            'kecamatan' => 'Tebet',
            'kelurahan' => 'Tebet Barat',
            'kode_pos' => '12810',
            'biteship_area_id' => 'IDNP11KOT' . fake()->randomNumber(6, true),
        ];
    }
}
