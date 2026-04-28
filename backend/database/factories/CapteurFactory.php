<?php

namespace Database\Factories;

use App\Models\Capteur;
use App\Models\Grandeur;
use App\Models\Microcontroleur;
use Illuminate\Database\Eloquent\Factories\Factory;

class CapteurFactory extends Factory
{
    protected $model = Capteur::class;

    public function definition(): array
    {
        return [
            'type_mesure' => Grandeur::factory(),
            'etat' => fake()->randomElement(['actif', 'inactif', 'defaillant']),
            'last_seen' => fake()->boolean() ? now() : null,
            'modele' => fake()->word(),
            'microcontroleur_id' => Microcontroleur::factory(),
        ];
    }
}
