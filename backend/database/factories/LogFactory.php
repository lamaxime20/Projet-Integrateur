<?php

namespace Database\Factories;

use App\Models\Log;
use Illuminate\Database\Eloquent\Factories\Factory;

class LogFactory extends Factory
{
    protected $model = Log::class;

    public function definition(): array
    {
        return [
            'type' => fake()->word(),
            'description' => fake()->sentence(),
            'date' => now(),
            'source_type' => fake()->randomElement(['microcontroleur', 'user', 'system']),
            'source_id' => fake()->uuid(),
            'gravite' => fake()->randomElement(['faible', 'moyenne', 'critique']),
        ];
    }
}
