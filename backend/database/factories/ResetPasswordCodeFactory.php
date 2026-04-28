<?php

namespace Database\Factories;

use App\Models\ResetPasswordCode;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResetPasswordCodeFactory extends Factory
{
    protected $model = ResetPasswordCode::class;

    public function definition(): array
    {
        return [
            'user_id' => Utilisateur::factory()->create()->id,
            'code' => fake()->numerify('######'),
            'created_at' => now(),
            'expires_at' => now()->addMinutes(15),
            'is_used' => false,
        ];
    }
}
