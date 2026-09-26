<?php

namespace Database\Factories;

use App\Models\Pesanan;
use App\Models\PesananPembayaran;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PesananPembayaran>
 */
class PesananPembayaranFactory extends Factory
{
    protected $model = PesananPembayaran::class;

    public function definition(): array
    {
        $metode = fake()->randomElement(['bca_va', 'bni_va', 'bri_va', 'mandiri_bill', 'qris']);
        return [
            'pesanan_id' => Pesanan::factory(),
            'metode_bayar' => $metode,
            'midtrans_id' => 'TRX-' . fake()->numerify('##########'),
            'midtrans_status' => 'pending',
            'nomor_va' => str_contains($metode, 'va') ? fake()->numerify('80777##########') : null,
            'kode_biller' => $metode === 'mandiri_bill' ? '70012' : null,
            'qr_string' => $metode === 'qris' ? '00020101021226680016ID.CO.SHOPEE.WWW011893600918000000000002150000000000000000303UMI51440014ID.CO.QRIS.WWW0215ID10200000000000303UMI5204541153033605802ID5910CRSL STORE6007JAKARTA61051056062070703A016304' : null,
            'qr_code_url' => $metode === 'qris' ? 'https://api.sandbox.midtrans.com/v2/qris/mock/qr-code' : null,
            'waktu_kedaluwarsa' => now()->addDay(),
            'waktu_bayar' => null,
            'instruksi_bayar' => [
                'Buka m-Banking sesuai bank pilihan',
                'Pilih Transfer > Virtual Account',
                'Masukkan nomor Virtual Account',
                'Periksa detail pembayaran dan selesaikan transaksi',
            ],
            'payment_payload' => null,
        ];
    }
}
