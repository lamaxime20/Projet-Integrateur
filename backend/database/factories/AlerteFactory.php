<?php

namespace Database\Factories;

use App\Models\Alerte;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class AlerteFactory extends Factory
{
    protected $model = Alerte::class;

    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(['info', 'warning', 'error']),
            'message' => fake()->sentence(),
            'vu' => fake()->boolean(),
            'date_arrivee' => now(),
            'date_lu' => fake()->boolean() ? now() : null,
            'user_id' => Utilisateur::factory(),
        ];
    }
}
