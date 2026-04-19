<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Barbershop;
use App\Models\OperatingHour;
use App\Models\Service;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class AvailabilityService
{
    public function forDay(Barbershop $barbershop, Barber $barber, Service $service, CarbonInterface $dayInAzores): Collection
    {
        $timezone = $barbershop->timezone ?: config('saas.default_timezone');
        $day = CarbonImmutable::parse($dayInAzores, $timezone)->startOfDay();
        $weekday = (int) $day->dayOfWeekIso;

        $operatingHour = OperatingHour::query()
            ->where('barbershop_id', $barbershop->id)
            ->where('weekday', $weekday)
            ->first();

        if (! $operatingHour || $operatingHour->is_closed) {
            return collect();
        }

        $slotStep = (int) config('saas.booking.slot_step_in_minutes', 15);
        $minNotice = (int) config('saas.booking.min_notice_in_minutes', 30);
        $openingAt = $day->setTimeFromTimeString($operatingHour->opens_at);
        $closingAt = $day->setTimeFromTimeString($operatingHour->closes_at);
        $lastStart = $closingAt->subMinutes($service->duration_minutes);

        $appointments = Appointment::query()
            ->where('barber_id', $barber->id)
            ->whereDate('starts_at', $day->clone()->utc()->toDateString())
            ->whereIn('status', ['pending', 'confirmed', 'booked'])
            ->orderBy('starts_at')
            ->get();

        $slots = collect();

        for ($current = $openingAt; $current->lte($lastStart); $current = $current->addMinutes($slotStep)) {
            if ($current->utc()->lessThan(now('UTC')->addMinutes($minNotice))) {
                continue;
            }

            $end = $current->addMinutes($service->duration_minutes);

            $isBusy = $appointments->contains(function (Appointment $appointment) use ($current, $end, $timezone): bool {
                $appointmentStart = $appointment->starts_at->copy()->timezone($timezone);
                $appointmentEnd = $appointment->ends_at->copy()->timezone($timezone);

                return $current < $appointmentEnd && $end > $appointmentStart;
            });

            if (! $isBusy) {
                $slots->push([
                    'starts_at_local' => $current->toIso8601String(),
                    'starts_at_utc' => $current->utc()->toIso8601String(),
                    'ends_at_local' => $end->toIso8601String(),
                ]);
            }
        }

        return $slots;
    }
}
