<?php

namespace App\Services;

use App\Models\Appointment;
use Carbon\CarbonInterface;

class AppointmentConflictService
{
    public function hasConflict(int $barberId, CarbonInterface $startsAtUtc, CarbonInterface $endsAtUtc, ?int $ignoreAppointmentId = null): bool
    {
        return Appointment::query()
            ->where('barber_id', $barberId)
            ->whereIn('status', ['pending', 'confirmed', 'booked'])
            ->when($ignoreAppointmentId, fn ($query) => $query->whereKeyNot($ignoreAppointmentId))
            ->where(function ($query) use ($startsAtUtc, $endsAtUtc): void {
                $query
                    ->whereBetween('starts_at', [$startsAtUtc, $endsAtUtc->copy()->subSecond()])
                    ->orWhereBetween('ends_at', [$startsAtUtc->copy()->addSecond(), $endsAtUtc])
                    ->orWhere(function ($nested) use ($startsAtUtc, $endsAtUtc): void {
                        $nested
                            ->where('starts_at', '<=', $startsAtUtc)
                            ->where('ends_at', '>=', $endsAtUtc);
                    });
            })
            ->exists();
    }
}
