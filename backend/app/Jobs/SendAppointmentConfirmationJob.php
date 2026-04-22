<?php

namespace App\Jobs;

use App\Mail\AppointmentConfirmedMail;
use App\Mail\AppointmentOwnerNotificationMail;
use App\Models\Appointment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
                ->with(['barbershop.user', 'barber', 'service'])
                ->lockForUpdate()
                ->find($this->appointmentId);

            if (! $appointment) {
                return;
            }

            if ($appointment->status?->value === 'cancelled' || $appointment->status?->value === 'completed') {
                return;
            }

            if ($appointment->client_email && ! $appointment->confirmation_sent_at) {
                try {
                    Mail::to($appointment->client_email)->send(new AppointmentConfirmedMail($appointment));

                    $appointment->forceFill([
                        'confirmation_sent_at' => now(),
                    ])->save();
                } catch (\Throwable $exception) {
                    Log::error('Falha ao enviar email de confirmação ao cliente.', [
                        'appointment_id' => $appointment->id,
                        'error' => $exception->getMessage(),
                    ]);
                }
            }

            $ownerEmail = $appointment->barbershop?->email ?: $appointment->barbershop?->user?->email;

            if ($ownerEmail && ! $appointment->owner_notification_sent_at) {
                try {
                    Mail::to($ownerEmail)->send(new AppointmentOwnerNotificationMail($appointment));

                    $appointment->forceFill([
                        'owner_notification_sent_at' => now(),
                    ])->save();
                } catch (\Throwable $exception) {
                    Log::error('Falha ao enviar email de nova marcação à barbearia.', [
                        'appointment_id' => $appointment->id,
                        'owner_email' => $ownerEmail,
                        'error' => $exception->getMessage(),
                    ]);
                }
            }
        }, 3);
    }
}
