<?php

namespace Database\Factories;

use App\Models\Grandeur;
use Illuminate\Database\Eloquent\Factories\Factory;

class GrandeurFactory extends Factory
{
    protected $model = Grandeur::class;

    public function definition(): array
    {
        $grandeurs = ['Température', 'Humidité', 'Pression', 'Luminosité', 'Vitesse', 'Densité'];
        
        return [
            'name' => fake()->randomElement($grandeurs),
        ];
    }
}
