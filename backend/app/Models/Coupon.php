<?php

namespace App\Models;

use App\Models\Concerns\BelongsToBarbershop;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use BelongsToBarbershop;
    use HasFactory;

    protected $fillable = [
        'barbershop_id',
        'code',
        'type',
        'value',
        'starts_at',
        'ends_at',
        'usage_limit',
        'times_redeemed',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
