<?php

namespace Database\Factories;

use App\Models\Session;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class SessionFactory extends Factory
{
    protected $model = Session::class;

    public function definition(): array
    {
        return [
            'token' => fake()->unique()->sha256(),
            'user_id' => Utilisateur::factory(),
            'role' => fake()->randomElement(['admin', 'user']),
            'created_at' => now(),
            'expires_at' => now()->addHours(24),
            'is_revoked' => false,
        ];
    }
}
