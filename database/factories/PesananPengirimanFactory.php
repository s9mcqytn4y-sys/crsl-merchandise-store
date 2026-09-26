<?php

namespace Database\Factories;

use App\Models\Pesanan;
use App\Models\PesananPengiriman;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PesananPengiriman>
 */
class PesananPengirimanFactory extends Factory
{
    protected $model = PesananPengiriman::class;

    public function definition(): array
    {
        $kurir = fake()->randomElement(['jne', 'sicepat', 'jnt']);
        return [
            'pesanan_id' => Pesanan::factory(),
            'kurir' => $kurir,
            'layanan' => 'Reguler',
            'nomor_resi' => strtoupper($kurir) . fake()->numerify('##########'),
            'biteship_order_id' => 'BS-' . fake()->numerify('##########'),
            'tracking_status' => 'allocated',
            'json_payload' => [
                'nama_penerima' => fake()->name(),
                'telepon' => '08' . fake()->numerify('##########'),
                'alamat_lengkap' => fake()->address(),
                'kota' => 'Jakarta Selatan',
                'provinsi' => 'DKI Jakarta',
            ],
        ];
    }
}
