<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'buyer_id' => User::factory(),
            'handled_by' => null,
            'total_price' => fake()->randomFloat(2, 20, 1500),
            'status' => OrderStatus::PendingHandover,
            'claim_qr_code' => (string) Str::ulid(),
            'expires_at' => now()->addHours(24),
            'completed_at' => null,
        ];
    }

    /**
     * Indicate that the order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Completed,
            'handled_by' => User::factory(),
            'completed_at' => now(),
        ]);
    }

    /**
     * Indicate that the order is in cart status.
     */
    public function cart(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Cart,
            'claim_qr_code' => null,
            'expires_at' => now()->addMinutes(15),
        ]);
    }
}
