<?php

namespace Database\Factories;

use App\Models\MicrocontroleurToken;
use App\Models\Microcontroleur;
use Illuminate\Database\Eloquent\Factories\Factory;

class MicrocontroleurTokenFactory extends Factory
{
    protected $model = MicrocontroleurToken::class;

    public function definition(): array
    {
        return [
            'token' => fake()->unique()->sha256(),
            'microcontroleur_id' => Microcontroleur::factory(),
            'created_at' => now(),
            'expires_at' => now()->addHours(24),
            'is_revoked' => false,
        ];
    }
}
