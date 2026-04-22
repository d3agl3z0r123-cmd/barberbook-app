<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentOwnerNotificationMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly Appointment $appointment)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nova marcação recebida no BarberBook',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointments.owner-notification',
        );
    }
}
