<?php

use App\Enums\ItemCondition;
use App\Enums\SettingKey;
use App\Models\Category;
use App\Models\Item;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => Storage::fake('public'));

it('renders the edit listing form for a pending drop-off item', function () {
    $category = Category::factory()->create();
    $item = Item::factory()->pendingDropoff()->create(['category_id' => $category->id]);

    $this->actingAs($item->seller->assignRole('student'))
        ->get(route('student.listings.edit', $item))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/listings/edit')
            ->where('item.id', $item->id)
            ->has('categories')
            ->has('conditions'));
});

it('lets the owner update a pending listing', function () {
    $category = Category::factory()->create();
    $item = Item::factory()->pendingDropoff()->create([
        'category_id' => $category->id,
        'title' => 'Original Title',
    ]);

    $response = $this->actingAs($item->seller->assignRole('student'))
        ->put(route('student.listings.update', $item), [
            'category_id' => $category->id,
            'title' => 'Updated Title',
            'description' => 'Updated Description',
            'condition' => 'used',
            'price' => '150.00',
            'quantity' => 1,
        ]);

    $response->assertRedirect(route('student.listings.show', $item));

    $item->refresh();
    expect($item->title)->toBe('Updated Title')
        ->and($item->condition)->toBe(ItemCondition::Used)
        ->and((float) $item->price)->toBe(150.0)
        ->and($item->quantity)->toBe(1);
});

it('refuses edits once the item is at the hub', function () {
    $item = Item::factory()->create(); // default status: available

    $this->actingAs($item->seller->assignRole('student'))
        ->put(route('student.listings.update', $item), [
            'category_id' => $item->category_id,
            'title' => 'New Title',
            'description' => $item->description,
            'condition' => 'like_new',
            'price' => '200.00',
            'quantity' => 1,
        ])
        ->assertForbidden();
});

it('soft-deletes a pending listing and removes its images', function () {
    Storage::disk('public')->put('items/a.jpg', 'fake-image-bytes');
    $item = Item::factory()->pendingDropoff()->create(['images' => ['items/a.jpg']]);

    $this->actingAs($item->seller->assignRole('student'))
        ->delete(route('student.listings.destroy', $item))
        ->assertRedirect(route('student.listings.index'));

    expect($item->fresh()->trashed())->toBeTrue();
    Storage::disk('public')->assertMissing('items/a.jpg');
});

it('forbids deleting an item that is already available at the hub', function () {
    $item = Item::factory()->create(); // available

    $this->actingAs($item->seller->assignRole('student'))
        ->delete(route('student.listings.destroy', $item))
        ->assertForbidden();
});

it('lists only my listings with status counts', function () {
    $me = User::factory()->student()->create();
    Item::factory()->for($me, 'seller')->pendingDropoff()->create();
    Item::factory()->for($me, 'seller')->create();
    Item::factory()->create(); // someone else

    $this->actingAs($me)->get(route('student.listings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/listings/index')
            ->has('listings.data', 2)
            ->where('statusCounts.pending_dropoff', 1)
            ->where('statusCounts.available', 1));
});

it('filters listings by status on the index page', function () {
    $me = User::factory()->student()->create();
    Item::factory()->for($me, 'seller')->pendingDropoff()->create();
    Item::factory()->for($me, 'seller')->create();

    $this->actingAs($me)->get(route('student.listings.index', ['status' => 'pending_dropoff']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/listings/index')
            ->has('listings.data', 1)
            ->where('listings.data.0.status', 'pending_dropoff'));
});

it('computes the shelf expiry date from the setting', function () {
    $this->freezeTime();
    Setting::put(SettingKey::ItemShelfExpiryDays, 10);
    $item = Item::factory()->create(['dropped_off_at' => now()]);

    expect($item->shelfExpiresAt()->getTimestamp())->toBe(now()->addDays(10)->getTimestamp());
});
