<?php

use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

it('renders returns page with expired and retrieved items', function () {
    $staff = User::factory()->staff()->create();
    Item::factory()->create(['status' => ItemStatus::Expired]);
    Item::factory()->create(['status' => ItemStatus::Retrieved]);

    $this->actingAs($staff)->get(route('staff.returns'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('staff/returns')
            ->has('expiredItems.data', 1)
            ->has('retrievedItems.data', 1));
});

it('marks expired item as retrieved when owner picks it up', function () {
    $staff = User::factory()->staff()->create();
    $item = Item::factory()->create(['status' => ItemStatus::Expired]);

    $this->actingAs($staff)->post(route('staff.returns.retrieve', $item))
        ->assertRedirect();

    expect($item->fresh()->status)->toBe(ItemStatus::Retrieved);

    $activity = Activity::inLog('hub')->where('event', HubEvent::ItemRetrieved->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($staff))->toBeTrue();
});

it('refuses retrieval if item is not expired', function () {
    $staff = User::factory()->staff()->create();
    $item = Item::factory()->create(['status' => ItemStatus::Available]);

    $this->actingAs($staff)->post(route('staff.returns.retrieve', $item))
        ->assertSessionHasErrors('item');
});
