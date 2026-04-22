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

Artisan::command('app:guard-production-database', function (): int {
    if (! app()->environment('production')) {
        $this->info('Ambiente local: SQLite permitido.');

        return self::SUCCESS;
    }

    $connection = (string) config('database.default');
    $host = (string) env('DB_HOST', '');
    $database = (string) env('DB_DATABASE', '');
    $username = (string) env('DB_USERNAME', '');
    $password = (string) env('DB_PASSWORD', '');

    if (
        $connection !== 'pgsql'
        || $host === ''
        || $host === '127.0.0.1'
        || $database === ''
        || $username === ''
        || $password === ''
    ) {
        $this->error('Configuração de produção insegura: a base de dados persistente PostgreSQL não está configurada.');
        $this->error('Define DB_CONNECTION=pgsql, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME e DB_PASSWORD na Railway.');

        return self::FAILURE;
    }

    $this->info("Base de dados persistente confirmada: {$connection} ({$host}/{$database}).");

    return self::SUCCESS;
})->purpose('Impedir deploy em produção sem base de dados PostgreSQL persistente');

Artisan::command('appointments:send-daily-reminders', function (AppointmentNotificationService $notifications): void {
    $count = $notifications->dispatchDailyReminders();

    $this->info("Lembretes preparados: {$count}");
})->purpose('Enviar lembretes diários das marcações do dia');

Artisan::command('app:ensure-admin', function (): int {
    $email = trim((string) env('ADMIN_EMAIL', ''));
    $password = (string) env('ADMIN_PASSWORD', '');

    if ($email === '' || $password === '') {
        $this->warn('ADMIN_EMAIL ou ADMIN_PASSWORD não definidos. Admin não foi alterado.');

        return self::SUCCESS;
    }

    $admin = User::query()->firstOrNew(['email' => Str::lower($email)]);
    $admin->name = env('ADMIN_NAME', 'Admin BarberBook');
    $admin->password = Hash::make($password);
    $admin->role = UserRole::Admin;
    $admin->timezone = 'Atlantic/Azores';
    $admin->is_active = true;
    $admin->is_super_admin = true;
    $admin->disabled_at = null;
    $admin->email_verified_at ??= now();
    $admin->save();

    $this->info("Admin garantido: {$admin->email}");

    return self::SUCCESS;
})->purpose('Criar ou atualizar o utilizador admin a partir das variaveis de ambiente');

Schedule::command('appointments:send-daily-reminders')
    ->dailyAt('07:00')
    ->timezone(config('app.timezone', 'Atlantic/Azores'));
