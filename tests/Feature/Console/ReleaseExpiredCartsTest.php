<?php

use App\Actions\Cart\AddToCart;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;

it('releases expired cart items and restores available inventory', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 1]); // starts with 1

    app(AddToCart::class)->handle($buyer, $item, 1); // item qty is now 0
    expect($item->fresh()->quantity)->toBe(0);

    $cart = Order::where('buyer_id', $buyer->id)->sole();
    $cart->update(['expires_at' => now()->subMinute()]);

    $this->artisan('unimart:release-expired-carts')
        ->assertSuccessful();

    expect($cart->fresh()->status)->toBe(OrderStatus::Expired)
        ->and($item->fresh()->quantity)->toBe(1);
});

it('does not release active unexpired carts', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);

    app(AddToCart::class)->handle($buyer, $item, 1);
    $cart = Order::where('buyer_id', $buyer->id)->sole();

    $this->artisan('unimart:release-expired-carts')
        ->assertSuccessful();

    expect($cart->fresh()->status)->toBe(OrderStatus::Cart)
        ->and($item->fresh()->quantity)->toBe(1);
});
