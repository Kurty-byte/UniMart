<?php

use App\Actions\Cart\AddToCart;
use App\Actions\Orders\CancelOrderReservation;
use App\Actions\Orders\CommitToBuy;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use Illuminate\Validation\ValidationException;

it('allows buyer to cancel a pending handover and restores inventory', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);
    $order = app(CommitToBuy::class)->handle($buyer, $orderItem->order);

    expect($item->fresh()->quantity)->toBe(1);

    app(CancelOrderReservation::class)->handle($buyer, $order);

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled)
        ->and($item->fresh()->quantity)->toBe(2);
});

it('cannot cancel an order that is already completed', function () {
    $buyer = User::factory()->student()->create();
    $order = Order::factory()->completed()->for($buyer, 'buyer')->create();

    expect(fn () => app(CancelOrderReservation::class)->handle($buyer, $order))
        ->toThrow(ValidationException::class, 'Only pending reservations can be cancelled.');
});

it('forbids another user from cancelling a reservation', function () {
    $buyer = User::factory()->student()->create();
    $other = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);
    $order = app(CommitToBuy::class)->handle($buyer, $orderItem->order);

    expect(fn () => app(CancelOrderReservation::class)->handle($other, $order))
        ->toThrow(ValidationException::class, 'You do not own this reservation.');
});
