<?php

namespace Database\Factories;

use App\Enums\PayoutStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'item_id' => Item::factory(),
            'quantity' => 1,
            'price' => fake()->randomFloat(2, 20, 500),
            'payout_status' => PayoutStatus::Pending,
            'paid_by' => null,
            'paid_at' => null,
        ];
    }

    /**
     * Indicate that the item payout is paid digitally.
     */
    public function paidDigitally(): static
    {
        return $this->state(fn (array $attributes) => [
            'payout_status' => PayoutStatus::PaidDigitally,
            'paid_by' => User::factory(),
            'paid_at' => now(),
        ]);
    }

    /**
     * Indicate that the cash payout has been claimed.
     */
    public function cashClaimed(): static
    {
        return $this->state(fn (array $attributes) => [
            'payout_status' => PayoutStatus::CashClaimed,
            'paid_by' => User::factory(),
            'paid_at' => now(),
        ]);
    }
}
