<?php

use App\Actions\Cart\AddToCart;
use App\Actions\Orders\CommitToBuy;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use Illuminate\Validation\ValidationException;

it('converts an active cart into a pending handover order with a claim QR code', function () {
    $this->freezeTime();
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['price' => 200]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);
    $cart = $orderItem->order;

    $order = app(CommitToBuy::class)->handle($buyer, $cart);

    expect($order->status)->toBe(OrderStatus::PendingHandover)
        ->and($order->claim_qr_code)->toHaveLength(26)
        ->and($order->expires_at->getTimestamp())->toBe(now()->addHours(24)->getTimestamp());
});

it('rejects checkout if cart has already expired', function () {
    $this->freezeTime();
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create();
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);
    $cart = $orderItem->order;

    $this->travel(16)->minutes(); // expired soft hold

    expect(fn () => app(CommitToBuy::class)->handle($buyer, $cart))
        ->toThrow(ValidationException::class, 'Your cart reservation has expired.');
});

it('rejects checkout on an empty cart', function () {
    $buyer = User::factory()->student()->create();
    $cart = Order::create(['buyer_id' => $buyer->id, 'status' => OrderStatus::Cart, 'total_price' => 0]);

    expect(fn () => app(CommitToBuy::class)->handle($buyer, $cart))
        ->toThrow(ValidationException::class, 'Your cart is empty.');
});

it('rejects checkout if user is not the cart owner', function () {
    $buyer = User::factory()->student()->create();
    $otherBuyer = User::factory()->student()->create();
    $item = Item::factory()->create();
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);

    expect(fn () => app(CommitToBuy::class)->handle($otherBuyer, $orderItem->order))
        ->toThrow(ValidationException::class, 'You do not own this cart.');
});
