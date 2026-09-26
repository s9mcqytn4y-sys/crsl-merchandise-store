<?php

namespace Database\Factories;

use App\Models\ItemPesanan;
use App\Models\Pesanan;
use App\Models\Produk;
use App\Models\ProdukVarian;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ItemPesanan>
 */
class ItemPesananFactory extends Factory
{
    protected $model = ItemPesanan::class;

    public function definition(): array
    {
        return [
            'pesanan_id' => Pesanan::factory(),
            'produk_id' => Produk::factory(),
            'produk_varian_id' => ProdukVarian::factory(),
            'nama_produk' => 'CRSL Signature Merchandise',
            'sku' => 'CRSL-SIG-001',
            'harga' => 289000,
            'jumlah' => 1,
            'ukuran' => 'All Size',
            'warna' => 'Black',
            'gambar' => '/assets/gambar/drinke-tumblr.webp',
        ];
    }
}
