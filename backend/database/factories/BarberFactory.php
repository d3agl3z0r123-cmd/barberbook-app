<?php

namespace Database\Factories;

use App\Models\Barber;
use App\Models\Barbershop;
use Illuminate\Database\Eloquent\Factories\Factory;

class BarberFactory extends Factory
{
    protected $model = Barber::class;

    public function definition(): array
    {
        return [
            'barbershop_id' => Barbershop::factory(),
            'name' => fake()->name(),
            'bio' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
