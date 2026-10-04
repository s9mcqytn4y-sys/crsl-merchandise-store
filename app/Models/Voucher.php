<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasFactory;

    protected $table = 'voucher';

    protected $fillable = [
        'kode',
        'judul',
        'deskripsi',
        'tipe',
        'nilai',
        'min_belanja',
        'maksimal_diskon',
        'syarat_kurir',
        'tier_minimal_id',
        'kuota',
        'berlaku_dari',
        'berlaku_sampai',
        'aktif',
        'tampil_publik',
    ];

    protected $casts = [
        'nilai' => 'float',
        'min_belanja' => 'float',
        'maksimal_diskon' => 'float',
        'kuota' => 'integer',
        'aktif' => 'boolean',
        'tampil_publik' => 'boolean',
        'tier_minimal_id' => 'integer',
        'berlaku_dari' => 'datetime',
        'berlaku_sampai' => 'datetime',
    ];

    protected $appends = ['minimal_belanja'];

    public function getMinimalBelanjaAttribute(): float
    {
        return (float) ($this->attributes['min_belanja'] ?? 0);
    }

    public function tierMinimal(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(TierLoyalitas::class, 'tier_minimal_id');
    }

    public function pemakaian(): HasMany
    {
        return $this->hasMany(VoucherTerpakai::class, 'voucher_id');
    }
}
