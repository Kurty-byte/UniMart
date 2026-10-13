<?php

namespace Database\Factories;

use App\Enums\ItemCondition;
use App\Enums\ItemStatus;
use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'seller_id' => User::factory(),
            'category_id' => Category::factory(),
            'title' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'condition' => fake()->randomElement(ItemCondition::cases()),
            'images' => [fake()->imageUrl()],
            'price' => fake()->randomFloat(2, 10, 1000),
            'quantity' => fake()->numberBetween(1, 5),
            'status' => ItemStatus::Available,
            'shelf_location' => fake()->bothify('Shelf-##?'),
            'dropoff_qr_code' => (string) Str::ulid(),
            'dropped_off_at' => now(),
        ];
    }

    /**
     * Indicate that the item is pending dropoff.
     */
    public function pendingDropoff(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ItemStatus::PendingDropoff,
            'dropped_off_at' => null,
            'shelf_location' => null,
        ]);
    }

    /**
     * Indicate that the item is sold.
     */
    public function sold(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ItemStatus::Sold,
        ]);
    }

    /**
     * Indicate that the item is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ItemStatus::Expired,
        ]);
    }
}
