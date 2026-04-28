<?php

namespace Database\Factories;

use App\Models\Actionneur;
use App\Models\Microcontroleur;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActionneurFactory extends Factory
{
    protected $model = Actionneur::class;

    public function definition(): array
    {
        return [
            'etat' => fake()->randomElement(['actif', 'inactif', 'defaillant']),
            'last_seen' => fake()->boolean() ? now() : null,
            'modele' => fake()->word(),
            'microcontroleur_id' => Microcontroleur::factory(),
        ];
    }
}
