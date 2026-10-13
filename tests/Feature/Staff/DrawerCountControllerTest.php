<?php

use App\Actions\Shifts\OpenShift;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders drawer count page with shift status', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('staff.drawer-count'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('staff/drawer-count')
            ->where('activeShift', null)
            ->has('pastShifts'));
});

it('opens a shift from the UI form', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->post(route('staff.shifts.open'), [
        'opening_cash' => '1000.00',
    ])->assertRedirect(route('staff.drawer-count'));

    expect($staff->activeShift())->not->toBeNull()
        ->and($staff->activeShift()->opening_cash)->toBe('1000.00');
});

it('closes a shift from the UI form', function () {
    $staff = User::factory()->staff()->create();
    $shift = app(OpenShift::class)->handle($staff, '1000.00');

    $this->actingAs($staff)->post(route('staff.shifts.close'), [
        'actual_cash' => '1000.00',
        'notes' => 'Perfect balance',
    ])->assertRedirect(route('staff.drawer-count'));

    expect($staff->activeShift())->toBeNull()
        ->and($shift->fresh()->shift_ended_at)->not->toBeNull();
});

it('blocks access to protected desk routes when shift is not open', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('staff.payouts'))
        ->assertRedirect(route('staff.drawer-count'));
});

it('allows access to protected desk routes when shift is open', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '500.00');

    $this->actingAs($staff)->get(route('staff.payouts'))
        ->assertOk();
});
