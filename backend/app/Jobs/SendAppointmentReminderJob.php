<?php

namespace App\Jobs;

use App\Mail\AppointmentReminderMail;
use App\Models\Appointment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendAppointmentReminderJob implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly int $appointmentId)
    {
    }

    public function handle(): void
    {
        DB::transaction(function (): void {
            $appointment = Appointment::query()
                ->with(['barbershop', 'barber', 'service'])
                ->lockForUpdate()
                ->find($this->appointmentId);

            if (! $appointment || ! $appointment->client_email || $appointment->reminder_sent_at) {
                return;
            }

            $status = $appointment->status?->value ?? (string) $appointment->status;

            if (in_array($status, ['cancelled', 'completed'], true)) {
                return;
            }

            Mail::to($appointment->client_email)->send(new AppointmentReminderMail($appointment));

            $appointment->forceFill([
                'reminder_sent_at' => now(),
            ])->save();
        }, 3);
    }
}
