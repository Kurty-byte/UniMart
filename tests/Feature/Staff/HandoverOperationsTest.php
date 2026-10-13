<?php

use App\Actions\Cart\AddToCart;
use App\Actions\Orders\CommitToBuy;
use App\Actions\Shifts\OpenShift;
use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

it('renders claims page with pending handover orders', function () {
    $staff = User::factory()->staff()->create();
    $buyer = User::factory()->student()->create();

    Order::factory()->count(2)->create([
        'buyer_id' => $buyer->id,
        'status' => OrderStatus::PendingHandover,
    ]);

    $this->actingAs($staff)->get(route('staff.claims'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('staff/claims')
            ->has('pendingClaims.data', 2));
});

it('completes order handover, marks item sold, and records cash taken', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '500.00');

    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 1, 'price' => '150.00']);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);
    $order = app(CommitToBuy::class)->handle($buyer, $orderItem->order);

    $this->actingAs($staff)->post(route('staff.claims.complete', $order))
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(OrderStatus::Completed)
        ->and($order->fresh()->handled_by)->toBe($staff->id)
        ->and($item->fresh()->status)->toBe(ItemStatus::Sold);

    expect($order->fresh()->orderItems->first()->payout_status)->toBe(PayoutStatus::Pending);

    $activity = Activity::inLog('hub')->where('event', HubEvent::ClaimCompleted->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($staff))->toBeTrue()
        ->and($activity->getProperty('amount'))->toBe('150.00');
});

it('refuses handover if claim has expired', function () {
    $this->freezeTime();
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '500.00');

    $order = Order::factory()->create([
        'status' => OrderStatus::PendingHandover,
        'expires_at' => now()->subMinutes(5),
    ]);

    $this->actingAs($staff)->post(route('staff.claims.complete', $order))
        ->assertSessionHasErrors('order');
});

it('refuses handover if staff does not have an open shift', function () {
    $staff = User::factory()->staff()->create();
    $order = Order::factory()->create([
        'status' => OrderStatus::PendingHandover,
        'expires_at' => now()->addHours(12),
    ]);

    $this->actingAs($staff)->post(route('staff.claims.complete', $order))
        ->assertRedirect(route('staff.drawer-count'));
});

it('refuses handover if order is not pending handover', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '500.00');

    $order = Order::factory()->create([
        'status' => OrderStatus::Completed,
        'expires_at' => now()->addHours(12),
    ]);

    $this->actingAs($staff)->post(route('staff.claims.complete', $order))
        ->assertSessionHasErrors('order');
});
