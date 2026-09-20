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
        'tipe',
        'nilai',
        'min_belanja',
        'syarat_kurir',
        'kuota',
        'berlaku_dari',
        'berlaku_sampai',
        'aktif',
    ];

    protected $casts = [
        'nilai' => 'float',
        'min_belanja' => 'float',
        'kuota' => 'integer',
        'aktif' => 'boolean',
        'berlaku_dari' => 'datetime',
        'berlaku_sampai' => 'datetime',
    ];

    public function pemakaian(): HasMany
    {
        return $this->hasMany(VoucherTerpakai::class, 'voucher_id');
    }
}
