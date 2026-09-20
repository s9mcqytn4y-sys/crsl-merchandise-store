<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdukVarian extends Model
{
    use HasFactory;

    protected $table = 'produk_varian';

    protected $fillable = [
        'produk_id',
        'sku',
        'nama_varian',
        'tipe_varian',
        'warna',
        'warna_hex',
        'warna_gambar',
        'ukuran',
        'harga_tambahan',
        'stok',
        'gambar_varian',
        'aktif',
    ];

    protected $casts = [
        'aktif' => 'boolean',
        'harga_tambahan' => 'float',
        'stok' => 'integer',
    ];

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
}
