<?php

use App\Actions\Cart\AddToCart;
use App\Actions\Cart\RefreshCartHold;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;

it('refreshes active cart hold on student web navigation', function () {
    $this->freezeTime();
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);
    app(AddToCart::class)->handle($buyer, $item, 1);

    $cart = Order::where('buyer_id', $buyer->id)->where('status', OrderStatus::Cart)->sole();
    $originalExpiry = $cart->expires_at;

    $this->travel(5)->minutes();

    $this->actingAs($buyer)->get(route('student.browse'))->assertOk();

    expect($cart->fresh()->expires_at->getTimestamp())->toBe(now()->addMinutes(15)->getTimestamp())
        ->and($cart->fresh()->expires_at->greaterThan($originalExpiry))->toBeTrue();
});

it('does not refresh a cart hold that has already expired', function () {
    $this->freezeTime();
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);
    app(AddToCart::class)->handle($buyer, $item, 1);

    $cart = Order::where('buyer_id', $buyer->id)->where('status', OrderStatus::Cart)->sole();

    // Travel past 15 min expiry
    $this->travel(16)->minutes();

    $refreshed = app(RefreshCartHold::class)->handle($cart->fresh());
    expect($refreshed)->toBeFalse();
});

it('responds to explicit cart heartbeat and extends hold timer', function () {
    $this->freezeTime();
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);
    app(AddToCart::class)->handle($buyer, $item, 1);

    $cart = Order::where('buyer_id', $buyer->id)->where('status', OrderStatus::Cart)->sole();

    $this->travel(5)->minutes();

    $response = $this->actingAs($buyer)->postJson(route('student.cart.heartbeat'));
    $response->assertOk()
        ->assertJson([
            'status' => 'active',
        ]);

    expect($cart->fresh()->expires_at->getTimestamp())->toBe(now()->addMinutes(15)->getTimestamp());
});

it('returns expired status from heartbeat if hold has expired', function () {
    $this->freezeTime();
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);
    app(AddToCart::class)->handle($buyer, $item, 1);

    $this->travel(16)->minutes();

    $response = $this->actingAs($buyer)->postJson(route('student.cart.heartbeat'));
    $response->assertOk()
        ->assertJson([
            'status' => 'expired',
        ]);
});
