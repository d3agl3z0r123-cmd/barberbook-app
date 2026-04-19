<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Barbershop;
use App\Models\Client;
use App\Models\Service;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition(): array
    {
        $start = CarbonImmutable::now('UTC')->addDay()->setTime(10, 0);

        return [
            'barbershop_id' => Barbershop::factory(),
            'client_id' => Client::factory(),
            'barber_id' => Barber::factory(),
            'service_id' => Service::factory(),
            'starts_at' => $start,
            'ends_at' => $start->addMinutes(30),
            'status' => 'confirmed',
            'source' => 'dashboard',
            'notes' => null,
        ];
    }
}
