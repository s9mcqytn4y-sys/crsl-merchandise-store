<?php

namespace Database\Factories;

use App\Models\AlamatPengguna;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AlamatPengguna>
 */
class AlamatPenggunaFactory extends Factory
{
    protected $model = AlamatPengguna::class;

    public function definition(): array
    {
        return [
            'pengguna_id' => User::factory(),
            'label' => fake()->randomElement(['Rumah', 'Kantor', 'Kost']),
            'nama_penerima' => fake()->name(),
            'telepon' => '08' . fake()->numerify('##########'),
            'email' => fake()->safeEmail(),
            'negara' => 'Indonesia',
            'area_id' => 'IDNP11KOT789311',
            'provinsi' => 'DKI Jakarta',
            'kota' => 'Jakarta Pusat',
            'kecamatan' => 'Johar Baru',
            'kelurahan' => 'Johar Baru',
            'kode_pos' => '10560',
            'alamat_lengkap' => fake()->streetAddress() . ', Johar Baru',
            'rt_rw' => '001/002',
            'no_rumah' => fake()->buildingNumber(),
            'patokan' => 'Dekat minimarket',
            'adalah_utama' => false,
        ];
    }
}
