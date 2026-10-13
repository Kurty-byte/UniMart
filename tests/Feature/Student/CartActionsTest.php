<?php

use App\Actions\Cart\AddToCart;
use App\Actions\Cart\RemoveFromCart;
use App\Actions\Cart\UpdateCartItemQuantity;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Validation\ValidationException;

it('adds an item to cart and decrements available inventory', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 5, 'price' => 100.00]);

    $orderItem = app(AddToCart::class)->handle($buyer, $item, 2);

    expect($orderItem->quantity)->toBe(2)
        ->and($item->fresh()->quantity)->toBe(3)
        ->and($orderItem->order->status)->toBe(OrderStatus::Cart)
        ->and((float) $orderItem->order->total_price)->toBe(200.00)
        ->and($orderItem->order->expires_at)->not->toBeNull();
});

it('prevents a seller from adding their own listing to cart', function () {
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create(['quantity' => 5]);

    expect(fn () => app(AddToCart::class)->handle($seller, $item, 1))
        ->toThrow(ValidationException::class, 'You cannot purchase your own listing.');
});

it('prevents adding more than available quantity', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 1]);

    expect(fn () => app(AddToCart::class)->handle($buyer, $item, 2))
        ->toThrow(ValidationException::class, 'The requested quantity is no longer available.');
});

it('increments quantity if item already exists in active cart', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 5, 'price' => 50.00]);

    app(AddToCart::class)->handle($buyer, $item, 2);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);

    expect($orderItem->quantity)->toBe(3)
        ->and($item->fresh()->quantity)->toBe(2)
        ->and((float) $orderItem->order->fresh()->total_price)->toBe(150.00);
});

it('updates cart item quantity and adjusts available stock accordingly', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 5]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 2); // 3 left

    // Increase from 2 to 4
    app(UpdateCartItemQuantity::class)->handle($buyer, $orderItem, 4);
    expect($orderItem->fresh()->quantity)->toBe(4)
        ->and($item->fresh()->quantity)->toBe(1);

    // Decrease from 4 to 1
    app(UpdateCartItemQuantity::class)->handle($buyer, $orderItem, 1);
    expect($orderItem->fresh()->quantity)->toBe(1)
        ->and($item->fresh()->quantity)->toBe(4);
});

it('prevents increasing cart item quantity beyond available stock', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 2); // 0 left

    expect(fn () => app(UpdateCartItemQuantity::class)->handle($buyer, $orderItem, 3))
        ->toThrow(ValidationException::class, 'The requested quantity is no longer available.');
});

it('restores item quantity when removed from cart', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 5]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 2);

    app(RemoveFromCart::class)->handle($buyer, $orderItem);

    expect($item->fresh()->quantity)->toBe(5)
        ->and(OrderItem::find($orderItem->id))->toBeNull();
});
