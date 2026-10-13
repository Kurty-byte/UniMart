<?php

use App\Enums\PayoutStatus;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the student their sold items and earnings', function () {
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create(['price' => 500]);
    $orderItem = OrderItem::factory()->for($item)->create([
        'payout_status' => PayoutStatus::PaidDigitally,
        'price' => 500,
        'quantity' => 1,
    ]);

    $this->actingAs($seller)->get(route('student.sales'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/sales')
            ->has('soldItems.data', 1)
            ->where('totalEarned', '500.00'));
});

it('shows payout status overview and cash claim instructions', function () {
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();
    OrderItem::factory()->for($item)->create([
        'payout_status' => PayoutStatus::CashHeld,
        'price' => 300,
        'quantity' => 1,
    ]);

    $this->actingAs($seller)->get(route('student.payouts'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/payouts')
            ->where('summary.readyForPickup', '300.00')
            ->has('payouts')
            ->has('hasEwalletQr'));
});

it('does not include other users items in sales or payouts', function () {
    $sellerA = User::factory()->student()->create();
    $sellerB = User::factory()->student()->create();

    $itemB = Item::factory()->for($sellerB, 'seller')->create();
    OrderItem::factory()->for($itemB)->create([
        'payout_status' => PayoutStatus::PaidDigitally,
        'price' => 200,
        'quantity' => 1,
    ]);

    $this->actingAs($sellerA)->get(route('student.sales'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/sales')
            ->has('soldItems.data', 0)
            ->where('totalEarned', '0.00'));

    $this->actingAs($sellerA)->get(route('student.payouts'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/payouts')
            ->where('summary.totalPaid', '0.00')
            ->has('payouts.data', 0));
});
