<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TierLoyalitas extends Model
{
    use HasFactory;

    protected $table = 'tier_loyalitas';

    protected $fillable = [
        'nama',
        'slug',
        'syarat_belanja',
        'durasi_bulan',
        'bonus_poin_masuk',
        'poin_per_ulasan',
        'warna_aksen',
        'urutan',
    ];

    protected $casts = [
        'syarat_belanja' => 'float',
        'durasi_bulan' => 'integer',
        'bonus_poin_masuk' => 'integer',
        'poin_per_ulasan' => 'integer',
        'urutan' => 'integer',
    ];

    public function penggunaLoyalitas(): HasMany
    {
        return $this->hasMany(PenggunaLoyalitas::class, 'tier_id');
    }
}
