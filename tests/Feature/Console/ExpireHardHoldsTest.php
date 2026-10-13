<?php

use App\Actions\Cart\AddToCart;
use App\Actions\Orders\CommitToBuy;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\User;
use App\Notifications\OrderReservationExpiredNotification;
use Illuminate\Support\Facades\Notification;

it('expires unattended hard holds, restores inventory, and notifies buyer', function () {
    Notification::fake();
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 1]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);
    $order = app(CommitToBuy::class)->handle($buyer, $orderItem->order);

    $order->update(['expires_at' => now()->subHour()]);

    $this->artisan('unimart:expire-hard-holds')->assertSuccessful();

    expect($order->fresh()->status)->toBe(OrderStatus::Expired)
        ->and($item->fresh()->quantity)->toBe(1);

    Notification::assertSentTo($buyer, OrderReservationExpiredNotification::class);
});

it('does not expire hard holds that are still within the time window', function () {
    Notification::fake();
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 1]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);
    $order = app(CommitToBuy::class)->handle($buyer, $orderItem->order);

    $this->artisan('unimart:expire-hard-holds')->assertSuccessful();

    expect($order->fresh()->status)->toBe(OrderStatus::PendingHandover)
        ->and($item->fresh()->quantity)->toBe(0);

    Notification::assertNothingSent();
});
