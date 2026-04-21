<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\Auth\ResetPasswordNotification;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'timezone',
        'email_verified_at',
        'is_active',
        'is_super_admin',
        'disabled_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
            'is_super_admin' => 'boolean',
            'disabled_at' => 'datetime',
        ];
    }

    public function isSuperAdmin(): bool
    {
        $configuredEmail = (string) config('saas.super_admin_email');
        $role = $this->role instanceof UserRole ? $this->role : UserRole::tryFrom((string) $this->role);

        return (bool) $this->is_super_admin
            || ($configuredEmail !== '' && strcasecmp($this->email, $configuredEmail) === 0)
            || $role === UserRole::Admin;
    }

    public function barbershop(): HasOne
    {
        return $this->hasOne(Barbershop::class, 'user_id');
    }

    public function ownedBarbershops(): HasMany
    {
        return $this->hasMany(Barbershop::class, 'user_id');
    }

    public function memberships(): BelongsToMany
    {
        return $this->belongsToMany(Barbershop::class, 'barbershop_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'client_id');
    }

    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
