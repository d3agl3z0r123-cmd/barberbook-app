<?php

namespace App\Notifications\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $resetUrl = sprintf(
            '%s/reset-password?token=%s&email=%s',
            $frontendUrl,
            urlencode($this->token),
            urlencode((string) $notifiable->getEmailForPasswordReset())
        );

        return (new MailMessage())
            ->subject('Redefine a tua password BarberPro')
            ->greeting('Ola!')
            ->line('Recebemos um pedido para redefinir a password da tua conta BarberPro.')
            ->action('Redefinir password', $resetUrl)
            ->line('Se nao pediste esta recuperacao, podes ignorar este email.');
    }
}
