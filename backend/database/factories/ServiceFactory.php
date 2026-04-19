<?php

namespace Database\Factories;

use App\Models\Barbershop;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'barbershop_id' => Barbershop::factory(),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'duration_minutes' => 30,
            'price' => 15.00,
            'is_active' => true,
        ];
    }
}
