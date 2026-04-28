<?php

namespace Database\Factories;

use App\Models\Instruction;
use App\Models\Utilisateur;
use App\Models\Actionneur;
use Illuminate\Database\Eloquent\Factories\Factory;

class InstructionFactory extends Factory
{
    protected $model = Instruction::class;

    public function definition(): array
    {
        return [
            'action' => fake()->randomElement(['allumer', 'eteindre', 'augmenter', 'diminuer']),
            'duree' => fake()->boolean() ? fake()->randomNumber(3) : null,
            'statut' => fake()->randomElement(['en_attente', 'executee', 'echouee']),
            'date_arrivee' => now(),
            'user_id' => Utilisateur::factory()->create()->id,
            'actionneur_id' => Actionneur::factory()->create()->id,
        ];
    }
}
