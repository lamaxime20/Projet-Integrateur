<?php

namespace Database\Factories;

use App\Models\Donnee;
use App\Models\Capteur;
use Illuminate\Database\Eloquent\Factories\Factory;

class DonneeFactory extends Factory
{
    protected $model = Donnee::class;

    public function definition(): array
    {
        return [
            'valeur' => fake()->randomFloat(2, 0, 100),
            'date_arrivee' => now(),
            'capteur_id' => Capteur::factory()->create()->id,
        ];
    }
}
