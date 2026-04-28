<?php

namespace Database\Factories;

use App\Models\Microcontroleur;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class MicrocontroleurFactory extends Factory
{
    protected $model = Microcontroleur::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->word(),
            'mac_address' => fake()->unique()->macAddress(),
            'identifiant_user' => fake()->uuid(),
            'reference' => fake()->bothify('MC-####'),
            'allume' => fake()->boolean(),
            'last_connexion' => fake()->boolean() ? now() : null,
            'date_installation' => fake()->dateTimeThisYear(),
            'passkey' => fake()->sha256(),
            'user_id' => Utilisateur::factory(),
        ];
    }
}
