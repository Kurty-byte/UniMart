<?php

use App\Actions\Cart\AddToCart;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the cart page with active items and hold timer', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['title' => 'Biology Book', 'price' => 150]);
    app(AddToCart::class)->handle($buyer, $item, 1);

    $this->actingAs($buyer)->get(route('student.cart'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/cart')
            ->has('cart.items', 1)
            ->where('cart.total_price', '150.00')
            ->has('cart.expires_at')
            ->where('cart.hasItems', true));
});

it('renders empty cart state when no active items exist', function () {
    $buyer = User::factory()->student()->create();

    $this->actingAs($buyer)->get(route('student.cart'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/cart')
            ->where('cart.items', [])
            ->where('cart.hasItems', false));
});

it('adds an item to cart via http request', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 5]);

    $this->actingAs($buyer)
        ->post(route('student.cart.items.store'), [
            'item_id' => $item->id,
            'quantity' => 2,
        ])
        ->assertRedirect();

    expect($item->fresh()->quantity)->toBe(3);
});

it('allows updating cart quantity via http', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 5]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 1);

    $this->actingAs($buyer)
        ->patch(route('student.cart.items.update', $orderItem), ['quantity' => 3])
        ->assertRedirect(route('student.cart'));

    expect($orderItem->fresh()->quantity)->toBe(3)
        ->and($item->fresh()->quantity)->toBe(2);
});

it('removes an item from cart via http', function () {
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 5]);
    $orderItem = app(AddToCart::class)->handle($buyer, $item, 2);

    $this->actingAs($buyer)
        ->delete(route('student.cart.items.destroy', $orderItem))
        ->assertRedirect(route('student.cart'));

    expect($item->fresh()->quantity)->toBe(5)
        ->and(OrderItem::find($orderItem->id))->toBeNull();
});

it('forbids updating another user cart item', function () {
    $otherBuyer = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 5]);
    $orderItem = app(AddToCart::class)->handle($otherBuyer, $item, 1);

    $this->actingAs(User::factory()->student()->create())
        ->patch(route('student.cart.items.update', $orderItem), ['quantity' => 2])
        ->assertForbidden();
});

it('clears all items in the active cart', function () {
    $buyer = User::factory()->student()->create();
    $item1 = Item::factory()->create(['quantity' => 5]);
    $item2 = Item::factory()->create(['quantity' => 3]);

    app(AddToCart::class)->handle($buyer, $item1, 2);
    app(AddToCart::class)->handle($buyer, $item2, 1);

    $this->actingAs($buyer)
        ->delete(route('student.cart.clear'))
        ->assertRedirect(route('student.cart'));

    expect($item1->fresh()->quantity)->toBe(5)
        ->and($item2->fresh()->quantity)->toBe(3);
});
