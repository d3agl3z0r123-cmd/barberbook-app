<?php

namespace App\Models\Concerns;

use App\Models\Barbershop;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToBarbershop
{
    public function barbershop(): BelongsTo
    {
        return $this->belongsTo(Barbershop::class);
    }
}
