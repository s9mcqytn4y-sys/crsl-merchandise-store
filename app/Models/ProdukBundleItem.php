<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdukBundleItem extends Model
{
    use HasFactory;

    protected $table = 'produk_bundle_item';

    protected $fillable = [
        'produk_id',
        'nama_item',
        'harga',
        'gambar',
        'varian',
        'urutan',
    ];

    protected $casts = [
        'harga' => 'integer',
        'varian' => 'array',
        'urutan' => 'integer',
    ];

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
}
