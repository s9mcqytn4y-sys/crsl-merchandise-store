<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlamatPengguna extends Model
{
    use HasFactory;

    protected $table = 'alamat_pengguna';

    protected $fillable = [
        'pengguna_id',
        'label',
        'nama_penerima',
        'telepon',
        'email',
        'negara',
        'area_id',
        'provinsi',
        'kota',
        'kecamatan',
        'kelurahan',
        'kode_pos',
        'alamat_lengkap',
        'rt_rw',
        'no_rumah',
        'patokan',
        'adalah_utama',
    ];

    protected $casts = [
        'adalah_utama' => 'boolean',
    ];

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengguna_id');
    }
}
