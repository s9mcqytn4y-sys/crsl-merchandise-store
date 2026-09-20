<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VoucherTerpakai extends Model
{
    use HasFactory;

    protected $table = 'voucher_terpakai';

    protected $fillable = [
        'voucher_id',
        'pengguna_id',
        'pesanan_id',
        'dipakai_pada',
    ];

    protected $casts = [
        'dipakai_pada' => 'datetime',
    ];

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class, 'voucher_id');
    }

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengguna_id');
    }

    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }
}
