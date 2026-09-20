<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produk extends Model
{
    use HasFactory;

    protected $table = 'produk';

    protected $fillable = [
        'kategori_id',
        'nama',
        'slug',
        'deskripsi',
        'harga_dasar',
        'harga_diskon',
        'stok_total',
        'berat_gram',
        'tipe_produk',
        'estimasi_po',
        'status_stok',
        'terjual',
        'is_best_seller',
        'gambar_utama',
        'aktif',
    ];

    protected $casts = [
        'aktif' => 'boolean',
        'is_best_seller' => 'boolean',
        'harga_dasar' => 'float',
        'harga_diskon' => 'float',
        'stok_total' => 'integer',
        'berat_gram' => 'integer',
        'terjual' => 'integer',
    ];

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }

    public function varian(): HasMany
    {
        return $this->hasMany(ProdukVarian::class, 'produk_id');
    }

    public function spesifikasi(): HasMany
    {
        return $this->hasMany(ProdukSpesifikasi::class, 'produk_id')->orderBy('urutan');
    }

    public function gambar(): HasMany
    {
        return $this->hasMany(GambarProduk::class, 'produk_id')->orderBy('urutan');
    }
}
