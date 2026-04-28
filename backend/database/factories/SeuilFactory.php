<?php

namespace Database\Factories;

use App\Models\Seuil;
use App\Models\Grandeur;
use App\Models\Utilisateur;
use App\Models\Microcontroleur;
use Illuminate\Database\Eloquent\Factories\Factory;

class SeuilFactory extends Factory
{
    protected $model = Seuil::class;

    public function definition(): array
    {
        $min = fake()->randomFloat(2, 0, 50);
        $max = fake()->randomFloat(2, $min + 1, 100);

        return [
            'type_mesure' => Grandeur::factory(),
            'valeur_max' => $max,
            'valeur_min' => $min,
            'updated_at' => now(),
            'user_id' => Utilisateur::factory(),
            'microcontroleur_id' => Microcontroleur::factory(),
        ];
    }
}
