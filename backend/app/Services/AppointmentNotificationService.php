<?php

namespace App\Services;

use App\Jobs\SendAppointmentConfirmationJob;
use App\Jobs\SendAppointmentReminderJob;
use App\Models\Appointment;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Log;

class AppointmentNotificationService
{
    public function dispatchConfirmation(Appointment $appointment): void
    {
        try {
            SendAppointmentConfirmationJob::dispatch($appointment->id);
        } catch (\Throwable $exception) {
            Log::error('Falha ao preparar emails de confirmação da marcação.', [
                'appointment_id' => $appointment->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    public function dispatchDailyReminders(): int
    {
        $timezone = config('app.timezone', 'Atlantic/Azores');
        $day = CarbonImmutable::now($timezone);
        $startsAtUtc = $day->startOfDay()->utc();
        $endsAtUtc = $day->endOfDay()->utc();

        $appointments = Appointment::query()
            ->whereBetween('starts_at', [$startsAtUtc, $endsAtUtc])
            ->whereNull('reminder_sent_at')
            ->whereNotNull('client_email')
            ->whereIn('status', ['booked', 'pending', 'confirmed'])
            ->pluck('id');

        foreach ($appointments as $appointmentId) {
            SendAppointmentReminderJob::dispatch($appointmentId);
        }

        return $appointments->count();
    }
}
