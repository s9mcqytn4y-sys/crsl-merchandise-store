<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PesanProduk extends Model
{
    use HasFactory;

    protected $table = 'pesan_produk';

    protected $fillable = [
        'pengguna_id',
        'produk_id',
        'nama_produk',
        'varian',
        'pesan',
    ];

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengguna_id');
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
}
