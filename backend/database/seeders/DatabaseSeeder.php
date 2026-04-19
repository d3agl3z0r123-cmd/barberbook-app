<?php

namespace Database\Seeders;

use App\Enums\AppointmentStatus;
use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Barbershop;
use App\Models\Client;
use App\Models\OperatingHour;
use App\Models\Service;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->create([
            'name' => 'Platform Admin',
            'email' => 'admin@barberpro.test',
            'password' => 'password',
            'role' => UserRole::Admin,
            'timezone' => 'Atlantic/Azores',
        ]);

        $owner = User::query()->create([
            'name' => 'Joao Owner',
            'email' => 'owner@barberpro.test',
            'password' => 'password',
            'role' => UserRole::Owner,
            'timezone' => 'Atlantic/Azores',
        ]);

        $clientUser = User::query()->create([
            'name' => 'Maria Cliente',
            'email' => 'client@barberpro.test',
            'password' => 'password',
            'role' => UserRole::Client,
            'timezone' => 'Atlantic/Azores',
        ]);

        $shop = Barbershop::query()->create([
            'owner_id' => $owner->id,
            'name' => 'Barbearia Central',
            'slug' => 'barbearia-central',
            'address' => 'Ponta Delgada, Sao Miguel',
            'phone' => '+351 296 000 000',
            'description' => 'Demo tenant com timezone dos Acores.',
            'timezone' => 'Atlantic/Azores',
        ]);

        $owner->memberships()->attach($shop->id, ['role' => UserRole::Owner->value]);

        foreach (range(1, 7) as $weekday) {
            OperatingHour::query()->create([
                'barbershop_id' => $shop->id,
                'weekday' => $weekday,
                'opens_at' => $weekday === 7 ? null : '09:00',
                'closes_at' => $weekday === 7 ? null : '19:00',
                'is_closed' => $weekday === 7,
            ]);
        }

        $barber = Barber::query()->create([
            'barbershop_id' => $shop->id,
            'name' => 'Carlos Fade',
            'bio' => 'Especialista em cortes classicos e barba.',
            'is_active' => true,
        ]);

        $service = Service::query()->create([
            'barbershop_id' => $shop->id,
            'name' => 'Corte + Barba',
            'duration_minutes' => 60,
            'price' => 22.50,
            'is_active' => true,
        ]);

        $client = Client::query()->create([
            'barbershop_id' => $shop->id,
            'user_id' => $clientUser->id,
            'name' => $clientUser->name,
            'email' => $clientUser->email,
            'phone' => '+351 912 345 678',
        ]);

        $start = CarbonImmutable::now('Atlantic/Azores')->addDay()->setTime(10, 0)->utc();

        Appointment::query()->create([
            'barbershop_id' => $shop->id,
            'client_id' => $client->id,
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'starts_at' => $start,
            'ends_at' => $start->addMinutes(60),
            'status' => AppointmentStatus::Confirmed,
            'source' => 'dashboard',
        ]);

        Subscription::query()->create([
            'barbershop_id' => $shop->id,
            'plan' => 'growth',
            'status' => 'trialing',
            'trial_ends_at' => now('UTC')->addDays(14),
        ]);
    }
}
