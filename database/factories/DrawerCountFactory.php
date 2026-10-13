<?php

namespace Database\Factories;

use App\Models\DrawerCount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DrawerCount>
 */
class DrawerCountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $expected = fake()->randomFloat(2, 500, 5000);

        return [
            'staff_id' => User::factory(),
            'shift_started_at' => now()->subHours(8),
            'shift_ended_at' => now(),
            'expected_cash' => $expected,
            'actual_cash' => $expected,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
