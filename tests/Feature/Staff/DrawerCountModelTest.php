<?php

use App\Models\DrawerCount;
use App\Models\User;

it('allows creating an open shift without end timestamp or actual cash', function () {
    $staff = User::factory()->staff()->create();

    $shift = DrawerCount::create([
        'staff_id' => $staff->id,
        'shift_started_at' => now(),
        'opening_cash' => 500.00,
    ]);

    expect($shift->shift_ended_at)->toBeNull()
        ->and($shift->actual_cash)->toBeNull()
        ->and((float) $shift->opening_cash)->toBe(500.00);
});

it('scopes query to currently open shifts', function () {
    $staff1 = User::factory()->staff()->create();
    $staff2 = User::factory()->staff()->create();

    $openShift = DrawerCount::create([
        'staff_id' => $staff1->id,
        'shift_started_at' => now(),
        'opening_cash' => 500.00,
    ]);

    DrawerCount::create([
        'staff_id' => $staff2->id,
        'shift_started_at' => now()->subHours(8),
        'shift_ended_at' => now(),
        'opening_cash' => 500.00,
        'expected_cash' => 500.00,
        'actual_cash' => 500.00,
    ]);

    $openShifts = DrawerCount::open()->get();

    expect($openShifts)->toHaveCount(1)
        ->and($openShifts->first()->id)->toBe($openShift->id);
});
