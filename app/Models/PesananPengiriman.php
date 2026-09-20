<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PesananPengiriman extends Model
{
    use HasFactory;

    protected $table = 'pesanan_pengiriman';

    protected $fillable = [
        'pesanan_id',
        'kurir',
        'layanan',
        'nomor_resi',
        'biteship_order_id',
        'tracking_status',
        'json_payload',
    ];

    protected $casts = [
        'json_payload' => 'array',
    ];

    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }
}
