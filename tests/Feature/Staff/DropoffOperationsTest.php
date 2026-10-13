<?php

use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

it('renders drop-offs page with pending items', function () {
    $staff = User::factory()->staff()->create();
    Item::factory()->pendingDropoff()->count(2)->create();

    $this->actingAs($staff)->get(route('staff.drop-offs'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('staff/drop-offs')
            ->has('pendingItems.data', 2));
});

it('approves a drop-off, assigns shelf location, and makes item available', function () {
    $staff = User::factory()->staff()->create();
    $item = Item::factory()->pendingDropoff()->create();

    $this->actingAs($staff)->post(route('staff.drop-offs.approve', $item), [
        'shelf_location' => 'Shelf-B04',
    ])->assertRedirect();

    expect($item->fresh()->status)->toBe(ItemStatus::Available)
        ->and($item->fresh()->shelf_location)->toBe('Shelf-B04')
        ->and($item->fresh()->dropped_off_at)->not->toBeNull();

    $activity = Activity::inLog('hub')->where('event', HubEvent::DropoffApproved->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($staff))->toBeTrue();
});

it('rejects a drop-off with a mandatory reason', function () {
    $staff = User::factory()->staff()->create();
    $item = Item::factory()->pendingDropoff()->create();

    $this->actingAs($staff)->post(route('staff.drop-offs.reject', $item), [
        'rejection_reason' => 'Item condition does not match description.',
    ])->assertRedirect();

    expect($item->fresh()->status)->toBe(ItemStatus::Rejected)
        ->and($item->fresh()->rejection_reason)->toBe('Item condition does not match description.');

    $activity = Activity::inLog('hub')->where('event', HubEvent::DropoffRejected->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($staff))->toBeTrue();
});

it('refuses double-approval on already approved item', function () {
    $staff = User::factory()->staff()->create();
    $item = Item::factory()->create(['status' => ItemStatus::Available]);

    $this->actingAs($staff)->post(route('staff.drop-offs.approve', $item), [
        'shelf_location' => 'Shelf-B04',
    ])->assertSessionHasErrors('item');
});

it('returns printable tracking tag data', function () {
    $staff = User::factory()->staff()->create();
    $item = Item::factory()->create([
        'status' => ItemStatus::Available,
        'shelf_location' => 'Shelf-A01',
    ]);

    $this->actingAs($staff)->getJson(route('staff.drop-offs.tag', $item))
        ->assertOk()
        ->assertJson([
            'id' => $item->id,
            'title' => $item->title,
            'shelf_location' => 'Shelf-A01',
        ]);
});

it('forbids staff without item.dropoff.approve permission', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $item = Item::factory()->pendingDropoff()->create();

    $this->actingAs($staff)->post(route('staff.drop-offs.approve', $item), [
        'shelf_location' => 'Shelf-B04',
    ])->assertForbidden();
});

