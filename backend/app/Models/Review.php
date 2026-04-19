<?php

namespace App\Models;

use App\Models\Concerns\BelongsToBarbershop;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use BelongsToBarbershop;
    use HasFactory;

    protected $fillable = [
        'barbershop_id',
        'appointment_id',
        'client_id',
        'rating',
        'comment',
    ];
}
