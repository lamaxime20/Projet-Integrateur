<?php

namespace Database\Factories;

use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UtilisateurFactory extends Factory
{
    protected $model = Utilisateur::class;

    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'password' => bcrypt('password'),
            'role' => fake()->randomElement(['admin', 'user']),
            'status' => 'actif',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
