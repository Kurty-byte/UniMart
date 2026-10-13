<?php

use App\Enums\HubEvent;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

it('creates a new staff member with assigned permissions', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.staff.store'), [
        'name' => 'Jane Desk',
        'email' => 'jane.desk@university.edu.ph',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'permissions' => ['process dropoffs', 'scan qr codes'],
    ])->assertRedirect();

    $staff = User::where('email', 'jane.desk@university.edu.ph')->first();
    expect($staff)->not->toBeNull()
        ->and($staff->hasRole('staff'))->toBeTrue()
        ->and($staff->can('process dropoffs'))->toBeTrue()
        ->and($staff->can('process payouts'))->toBeFalse();

    $activity = Activity::inLog('hub')->where('event', HubEvent::StaffAccountCreated->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue();
});

it('updates operational permissions for an existing staff member', function () {
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();
    $staff->givePermissionTo('process payouts');

    $this->actingAs($admin)->put(route('admin.staff.permissions.update', $staff), [
        'permissions' => ['process dropoffs'],
    ])->assertRedirect();

    expect($staff->fresh()->can('process payouts'))->toBeFalse()
        ->and($staff->fresh()->can('process dropoffs'))->toBeTrue();

    $activity = Activity::inLog('hub')->where('event', HubEvent::StaffPermissionsUpdated->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue();
});

it('revokes staff role and direct permissions', function () {
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();
    $staff->givePermissionTo('process dropoffs');

    $this->actingAs($admin)->delete(route('admin.staff.revoke', $staff))
        ->assertRedirect();

    expect($staff->fresh()->hasRole('staff'))->toBeFalse()
        ->and($staff->fresh()->can('process dropoffs'))->toBeFalse();

    $activity = Activity::inLog('hub')->where('event', HubEvent::StaffRoleRevoked->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue();
});

it('lists staff members with their permissions', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->staff()->create();

    $this->actingAs($admin)->get(route('admin.staff.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/staff')
            ->has('staffMembers.data')
            ->has('availablePermissions'));
});

it('prevents non-admins from managing staff', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('admin.staff.index'))
        ->assertForbidden();
});
