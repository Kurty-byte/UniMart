<?php

namespace Database\Factories;

use App\Enums\ReportStatus;
use App\Models\Item;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Report>
 */
class ReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reporter_id' => User::factory(),
            'reported_user_id' => User::factory(),
            'item_id' => Item::factory(),
            'reason' => fake()->paragraph(),
            'status' => ReportStatus::Pending,
            'resolved_by' => null,
            'resolved_at' => null,
        ];
    }

    /**
     * Indicate that the report has been resolved.
     */
    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReportStatus::Resolved,
            'resolved_by' => User::factory(),
            'resolved_at' => now(),
        ]);
    }

    /**
     * Indicate that the report has been dismissed.
     */
    public function dismissed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReportStatus::Dismissed,
            'resolved_by' => User::factory(),
            'resolved_at' => now(),
        ]);
    }
}
