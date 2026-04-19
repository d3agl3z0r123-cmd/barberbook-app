<?php

use App\Services\AppointmentNotificationService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('app:timezone', function (): void {
    $this->info(config('app.timezone'));
});

Artisan::command('appointments:send-daily-reminders', function (AppointmentNotificationService $notifications): void {
    $count = $notifications->dispatchDailyReminders();

    $this->info("Lembretes preparados: {$count}");
})->purpose('Enviar lembretes diários das marcações do dia');

Schedule::command('appointments:send-daily-reminders')
    ->dailyAt('08:00')
    ->timezone(config('app.timezone', 'Atlantic/Azores'));
