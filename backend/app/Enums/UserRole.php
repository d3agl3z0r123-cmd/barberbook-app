<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Owner = 'owner';
    case Barber = 'barber';
    case Client = 'client';

    public function isPlatformAdmin(): bool
    {
        return $this === self::Admin;
    }
}
