<?php

use App\Enums\UserRole;
use App\Models\User;
use App\Services\AppointmentNotificationService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Str;

Artisan::command('app:timezone', function (): void {
    $this->info(config('app.timezone'));
});

Artisan::command('appointments:send-daily-reminders', function (AppointmentNotificationService $notifications): void {
    $count = $notifications->dispatchDailyReminders();

    $this->info("Lembretes preparados: {$count}");
})->purpose('Enviar lembretes diarios das marcacoes do dia');

Artisan::command('app:ensure-admin', function (): int {
    $email = trim((string) env('ADMIN_EMAIL', ''));
    $password = (string) env('ADMIN_PASSWORD', '');

    if ($email === '' || $password === '') {
        $this->warn('ADMIN_EMAIL ou ADMIN_PASSWORD nao definidos. Admin nao foi alterado.');

        return self::SUCCESS;
    }

    $admin = User::query()->firstOrNew(['email' => Str::lower($email)]);
    $admin->name = env('ADMIN_NAME', 'Admin BarberBook');
    $admin->password = Hash::make($password);
    $admin->role = UserRole::Admin;
    $admin->timezone = 'Atlantic/Azores';
    $admin->email_verified_at ??= now();
    $admin->save();

    $this->info("Admin garantido: {$admin->email}");

    return self::SUCCESS;
})->purpose('Criar ou atualizar o utilizador admin a partir das variaveis de ambiente');

Schedule::command('appointments:send-daily-reminders')
    ->dailyAt('08:00')
    ->timezone(config('app.timezone', 'Atlantic/Azores'));
