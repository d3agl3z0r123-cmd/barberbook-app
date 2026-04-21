<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Barbershop extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'owner_id',
        'name',
        'slug',
        'address',
        'timezone',
        'phone',
        'email',
        'description',
        'is_active',
        'qr_path',
        'qr_url',
        'qr_generated_at',
        'qr_last_regenerated_at',
        'qr_metadata',
        'qr_scan_count',
        'qr_last_scanned_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'qr_generated_at' => 'datetime',
            'qr_last_regenerated_at' => 'datetime',
            'qr_metadata' => 'array',
            'qr_scan_count' => 'integer',
            'qr_last_scanned_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function team(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'barbershop_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function barbers(): HasMany
    {
        return $this->hasMany(Barber::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function operatingHours(): HasMany
    {
        return $this->hasMany(OperatingHour::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    public function qrScanEvents(): HasMany
    {
        return $this->hasMany(QrScanEvent::class);
    }
}
