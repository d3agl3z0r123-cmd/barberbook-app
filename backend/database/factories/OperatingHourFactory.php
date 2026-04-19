<?php

namespace Database\Factories;

use App\Models\Barbershop;
use App\Models\OperatingHour;
use Illuminate\Database\Eloquent\Factories\Factory;

class OperatingHourFactory extends Factory
{
    protected $model = OperatingHour::class;

    public function definition(): array
    {
        return [
            'barbershop_id' => Barbershop::factory(),
            'weekday' => 1,
            'opens_at' => '09:00',
            'closes_at' => '18:00',
            'is_closed' => false,
        ];
    }
}
