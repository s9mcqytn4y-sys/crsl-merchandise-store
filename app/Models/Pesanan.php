<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pesanan extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'pesanan';

    protected $fillable = [
        'nomor_pesanan',
        'pengguna_id',
        'status',
        'subtotal',
        'ongkir',
        'biaya_asuransi',
        'diskon',
        'total',
        'mata_uang',
        'catatan',
        'kode_voucher',
        'poin_digunakan',
        'poin_didapat',
        'is_dropship',
        'dropship_pengirim',
        'dropship_telepon',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'ongkir' => 'float',
        'biaya_asuransi' => 'float',
        'diskon' => 'float',
        'total' => 'float',
        'poin_digunakan' => 'integer',
        'poin_didapat' => 'integer',
        'is_dropship' => 'boolean',
    ];

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengguna_id');
    }

    public function item(): HasMany
    {
        return $this->hasMany(ItemPesanan::class, 'pesanan_id');
    }

    public function pengiriman(): HasOne
    {
        return $this->hasOne(PesananPengiriman::class, 'pesanan_id');
    }

    public function pembayaran(): HasOne
    {
        return $this->hasOne(PesananPembayaran::class, 'pesanan_id');
    }
}
