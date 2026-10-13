<?php

use App\Enums\StaffPermission;
use App\Models\User;

it('gives staff factory users the operational permissions directly', function () {
    $staff = User::factory()->staff()->create();

    expect($staff->hasRole('staff'))->toBeTrue()
        ->and($staff->getDirectPermissions()->pluck('name')->all())
        ->toEqualCanonicalizing(StaffPermission::values());
});

it('does not grant operational permissions through the staff role', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');

    expect($staff->can('access staff portal'))->toBeTrue()
        ->and($staff->can('scan qr codes'))->toBeTrue()
        ->and($staff->can('process dropoffs'))->toBeFalse();
});

it('grants admins every permission', function () {
    expect(User::factory()->admin()->create()->can('process payouts'))->toBeTrue();
});

it('gives student factory users the student role', function () {
    $student = User::factory()->student()->create();

    expect($student->hasRole('student'))->toBeTrue()
        ->and($student->can('browse catalog'))->toBeTrue()
        ->and($student->can('process dropoffs'))->toBeFalse();
});
