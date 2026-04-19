<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Barbershop;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BarbershopFactory extends Factory
{
    protected $model = Barbershop::class;

    public function definition(): array
    {
        return [
            'owner_id' => User::factory()->state(['role' => UserRole::Owner]),
            'name' => fake()->company(),
            'slug' => fake()->unique()->slug(),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'description' => fake()->sentence(),
            'timezone' => 'Atlantic/Azores',
            'is_active' => true,
        ];
    }
}
