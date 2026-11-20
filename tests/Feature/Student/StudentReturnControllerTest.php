<?php

use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows expired, rejected, and retrieved items belonging to the authenticated student', function () {
    $seller = User::factory()->student()->create();
    $otherSeller = User::factory()->student()->create();

    $expiredItem = Item::factory()->for($seller, 'seller')->expired()->create();
    $rejectedItem = Item::factory()->for($seller, 'seller')->create([
        'status' => ItemStatus::Rejected,
        'rejection_reason' => 'Torn cover page',
    ]);
    $retrievedItem = Item::factory()->for($seller, 'seller')->create([
        'status' => ItemStatus::Retrieved,
    ]);
    Item::factory()->for($otherSeller, 'seller')->expired()->create();

    $this->actingAs($seller)
        ->get(route('student.returns'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/returns')
            ->has('expiredItems', 1)
            ->where('expiredItems.0.id', $expiredItem->id)
            ->where('expiredItems.0.dropoff_qr_code', $expiredItem->dropoff_qr_code)
            ->where('expiredItems.0.dropoff_qr_code_svg', fn ($svg) => is_string($svg) && str_contains($svg, '<svg'))
            ->has('rejectedItems', 1)
            ->where('rejectedItems.0.id', $rejectedItem->id)
            ->where('rejectedItems.0.rejection_reason', 'Torn cover page')
            ->has('retrievedItems', 1)
            ->where('retrievedItems.0.id', $retrievedItem->id)
        );
});
