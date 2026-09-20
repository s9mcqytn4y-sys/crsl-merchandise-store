<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdukSpesifikasi extends Model
{
    use HasFactory;

    protected $table = 'produk_spesifikasi';

    protected $fillable = [
        'produk_id',
        'kunci',
        'nilai',
        'urutan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
}
