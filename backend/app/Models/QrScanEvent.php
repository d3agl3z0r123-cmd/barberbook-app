<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrScanEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'barbershop_id',
        'qr_url',
        'scanned_at',
        'ip_address',
        'user_agent',
        'referrer',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function barbershop(): BelongsTo
    {
        return $this->belongsTo(Barbershop::class);
    }
}
