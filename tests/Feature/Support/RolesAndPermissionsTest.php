<?php

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

it('gives staff factory users the operational permissions directly', function () {
    $staff = User::factory()->staff()->create();

    expect($staff->hasRole('staff'))->toBeTrue()
        ->and($staff->getDirectPermissions()->pluck('name')->all())
        ->toEqualCanonicalizing(RoleAndPermissionSeeder::STAFF_OPERATIONAL_PERMISSIONS);
});

it('does not grant operational permissions through the staff role', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');

    expect($staff->can('portal.staff.access'))->toBeTrue()
        ->and($staff->can('qr.scan'))->toBeTrue()
        ->and($staff->can('item.dropoff.approve'))->toBeFalse();
});

it('grants admins every permission', function () {
    expect(User::factory()->admin()->create()->can('payout.process'))->toBeTrue();
});

it('gives student factory users the student role and student permissions', function () {
    $student = User::factory()->student()->create();

    expect($student->hasRole('student'))->toBeTrue()
        ->and($student->can('item.view_any'))->toBeTrue()
        ->and($student->can('item.create'))->toBeTrue()
        ->and($student->can('item.dropoff.approve'))->toBeFalse();
});

