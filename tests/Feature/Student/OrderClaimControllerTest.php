<?php

use App\Actions\Cart\AddToCart;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('processes checkout from cart and redirects to claims page', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['price' => 100]);
    app(AddToCart::class)->handle($buyer, $item, 1);

    $this->actingAs($buyer)->post(route('student.cart.checkout'))
        ->assertRedirect(route('student.claims'));

    $order = Order::where('buyer_id', $buyer->id)->where('status', OrderStatus::PendingHandover)->first();
    expect($order)->not->toBeNull()
        ->and($order->claim_qr_code)->not->toBeNull();
});

it('renders the claims page with active and past orders', function () {
    $buyer = User::factory()->student()->create();
    Order::factory()->for($buyer, 'buyer')->create(['status' => OrderStatus::PendingHandover]);
    Order::factory()->for($buyer, 'buyer')->completed()->create();

    $this->actingAs($buyer)->get(route('student.claims'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/claims')
            ->has('activeClaims', 1)
            ->has('pastClaims', 1));
});

it('allows buyer to cancel a pending claim reservation via http', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);
    app(AddToCart::class)->handle($buyer, $item, 1);

    $this->actingAs($buyer)->post(route('student.cart.checkout'));
    $order = Order::where('buyer_id', $buyer->id)->where('status', OrderStatus::PendingHandover)->sole();

    $this->actingAs($buyer)->delete(route('student.claims.cancel', $order))
        ->assertRedirect(route('student.claims'));

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled)
        ->and($item->fresh()->quantity)->toBe(2);
});

it('forbids cancelling someone else claim', function () {
    $buyer = User::factory()->student()->create();
    $other = User::factory()->student()->create();
    $order = Order::factory()->for($buyer, 'buyer')->create(['status' => OrderStatus::PendingHandover]);

    $this->actingAs($other)->delete(route('student.claims.cancel', $order))
        ->assertForbidden();
});
