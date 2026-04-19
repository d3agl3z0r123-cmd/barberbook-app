<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use App\Models\Concerns\BelongsToBarbershop;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use BelongsToBarbershop;
    use HasFactory;

    protected $fillable = [
        'barbershop_id',
        'provider',
        'provider_customer_id',
        'provider_subscription_id',
        'plan',
        'status',
        'trial_ends_at',
        'current_period_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'trial_ends_at' => 'datetime',
            'current_period_ends_at' => 'datetime',
        ];
    }
}
