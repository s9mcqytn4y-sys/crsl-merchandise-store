<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Buku besar mutasi poin loyalitas pelanggan.
 */
class RiwayatPoin extends Model
{
    public const TIPE_DIDAPAT = 'didapat';
    public const TIPE_DIGUNAKAN = 'digunakan';
    public const TIPE_DIKEMBALIKAN = 'dikembalikan';
    public const TIPE_BONUS_REGISTRASI = 'bonus_registrasi';
    public const TIPE_PENYESUAIAN = 'penyesuaian';

    protected $table = 'riwayat_poin';

    protected $fillable = [
        'pengguna_id',
        'pesanan_id',
        'tipe',
        'jumlah',
        'saldo_akhir',
        'keterangan',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'saldo_akhir' => 'integer',
    ];

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengguna_id');
    }

    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }
}
