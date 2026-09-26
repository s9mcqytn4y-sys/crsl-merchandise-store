<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemPesanan extends Model
{
    use HasFactory;

    protected $table = 'item_pesanan';

    protected $fillable = [
        'pesanan_id',
        'produk_id',
        'produk_varian_id',
        'nama_produk',
        'sku',
        'harga',
        'jumlah',
        'ukuran',
        'warna',
        'gambar',
    ];

    protected $casts = [
        'harga' => 'float',
        'jumlah' => 'integer',
    ];

    protected $appends = [
        'gambar',
    ];

    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }

    public function varian(): BelongsTo
    {
        return $this->belongsTo(ProdukVarian::class, 'produk_varian_id');
    }

    /**
     * Accessor gambar item pesanan dengan fallback berjenjang:
     * 1. Kolom gambar pada item_pesanan
     * 2. Gambar varian produk (jika ada)
     * 3. Gambar utama produk
     * 4. Gambar default katalog CRSL
     */
    public function getGambarAttribute(?string $value): string
    {
        if (!empty($value)) {
            return $value;
        }

        if ($this->relationLoaded('varian') && !empty($this->varian?->gambar_varian)) {
            return $this->varian->gambar_varian;
        }

        if ($this->relationLoaded('produk') && !empty($this->produk?->gambar_utama)) {
            return $this->produk->gambar_utama;
        }

        // Jika belum diload, coba query relasi
        if ($this->produk_varian_id) {
            $varianImg = ProdukVarian::where('id', $this->produk_varian_id)->value('gambar_varian');
            if (!empty($varianImg)) {
                return $varianImg;
            }
        }

        if ($this->produk_id) {
            $produkImg = Produk::where('id', $this->produk_id)->value('gambar_utama');
            if (!empty($produkImg)) {
                return $produkImg;
            }
        }

        return '/assets/gambar/drinke-tumblr.webp';
    }
}
