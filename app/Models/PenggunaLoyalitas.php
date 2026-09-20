<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenggunaLoyalitas extends Model
{
    use HasFactory;

    protected $table = 'pengguna_loyalitas';

    protected $fillable = [
        'pengguna_id',
        'tier_id',
        'total_belanja',
        'poin',
        'diperbarui_pada',
    ];

    protected $casts = [
        'total_belanja' => 'float',
        'poin' => 'integer',
        'diperbarui_pada' => 'datetime',
    ];

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengguna_id');
    }

    public function tier(): BelongsTo
    {
        return $this->belongsTo(TierLoyalitas::class, 'tier_id');
    }
}
