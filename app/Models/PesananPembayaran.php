<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PesananPembayaran extends Model
{
    use HasFactory;

    protected $table = 'pesanan_pembayaran';

    protected $fillable = [
        'pesanan_id',
        'metode_bayar',
        'midtrans_id',
        'midtrans_status',
        'nomor_va',
        'kode_biller',
        'qr_string',
        'qr_code_url',
        'waktu_kedaluwarsa',
        'waktu_bayar',
        'instruksi_bayar',
        'payment_payload',
    ];

    protected $casts = [
        'waktu_kedaluwarsa' => 'datetime',
        'waktu_bayar' => 'datetime',
        'instruksi_bayar' => 'array',
        'payment_payload' => 'array',
    ];

    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }
}
