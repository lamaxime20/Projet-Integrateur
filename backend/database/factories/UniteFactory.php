<?php

namespace Database\Factories;

use App\Models\Unite;
use App\Models\Grandeur;
use Illuminate\Database\Eloquent\Factories\Factory;

class UniteFactory extends Factory
{
    protected $model = Unite::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'grandeur_physique' => Grandeur::factory(),
        ];
    }
}
