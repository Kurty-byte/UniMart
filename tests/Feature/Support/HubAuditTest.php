<?php

use App\Enums\HubEvent;
use App\Models\Item;
use App\Models\User;
use App\Support\HubAudit;
use Spatie\Activitylog\Models\Activity;

it('records a hub activity with event, causer, subject and properties', function () {
    $staff = User::factory()->staff()->create();
    $item = Item::factory()->create();

    HubAudit::record(HubEvent::DropoffApproved, $item, $staff, ['shelf_location' => 'A-1']);

    $activity = Activity::query()->inLog('hub')->latest('id')->first();
    expect($activity)->not->toBeNull()
        ->and($activity->event)->toBe('dropoff_approved')
        ->and($activity->causer->is($staff))->toBeTrue()
        ->and($activity->subject->is($item))->toBeTrue()
        ->and($activity->getProperty('shelf_location'))->toBe('A-1')
        ->and($activity->description)->toBe('Approved item drop-off');
});

it('records a hub activity anonymously when causer is null', function () {
    $item = Item::factory()->create();

    HubAudit::record(HubEvent::ItemExpired, $item, null, ['reason' => 'Shelf life exceeded']);

    $activity = Activity::query()->inLog('hub')->latest('id')->first();
    expect($activity)->not->toBeNull()
        ->and($activity->event)->toBe('item_expired')
        ->and($activity->causer_id)->toBeNull()
        ->and($activity->getProperty('reason'))->toBe('Shelf life exceeded');
});
