<?php

namespace App\Jobs;

use App\Mail\AppointmentConfirmedMail;
use App\Models\Appointment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendAppointmentConfirmationJob implements ShouldQueue
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

            if (! $appointment || ! $appointment->client_email || $appointment->confirmation_sent_at) {
                return;
            }

            if ($appointment->status?->value === 'cancelled' || $appointment->status?->value === 'completed') {
                return;
            }

            Mail::to($appointment->client_email)->send(new AppointmentConfirmedMail($appointment));

            $appointment->forceFill([
                'confirmation_sent_at' => now(),
            ])->save();
        }, 3);
    }
}
