<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WilayahIndonesia extends Model
{
    use HasFactory;

    protected $table = 'wilayah_indonesia';

    protected $fillable = [
        'provinsi',
        'kota',
        'tipe',
        'kecamatan',
        'kelurahan',
        'kode_pos',
        'biteship_area_id',
    ];
}
