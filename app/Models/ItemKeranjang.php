<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemKeranjang extends Model
{
    use HasFactory;

    protected $table = 'item_keranjang';

    protected $fillable = [
        'keranjang_id',
        'produk_id',
        'produk_varian_id',
        'jumlah',
    ];

    public function keranjang(): BelongsTo
    {
        return $this->belongsTo(Keranjang::class, 'keranjang_id');
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }

    public function varian(): BelongsTo
    {
        return $this->belongsTo(ProdukVarian::class, 'produk_varian_id');
    }

    public function produk_varian(): BelongsTo
    {
        return $this->belongsTo(ProdukVarian::class, 'produk_varian_id');
    }
}
