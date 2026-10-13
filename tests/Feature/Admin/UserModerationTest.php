<?php

use App\Actions\Cart\AddToCart;
use App\Enums\HubEvent;
use App\Enums\ReportStatus;
use App\Models\Item;
use App\Models\Report;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

it('suspends a user and releases their active held reservations', function () {
    $admin = User::factory()->admin()->create();
    $student = User::factory()->student()->create();
    $item = Item::factory()->create(['quantity' => 2]);
    app(AddToCart::class)->handle($student, $item, 1);

    $this->actingAs($admin)->post(route('admin.users.suspend', $student))->assertRedirect();

    expect($student->fresh()->isSuspended())->toBeTrue()
        ->and($item->fresh()->quantity)->toBe(2);

    $activity = Activity::inLog('hub')->where('event', HubEvent::UserSuspended->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue();
});

it('unsuspends a suspended user', function () {
    $admin = User::factory()->admin()->create();
    $student = User::factory()->student()->create(['suspended_at' => now()]);

    $this->actingAs($admin)->post(route('admin.users.unsuspend', $student))->assertRedirect();

    expect($student->fresh()->isSuspended())->toBeFalse();

    $activity = Activity::inLog('hub')->where('event', HubEvent::UserUnsuspended->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue();
});

it('resolves a user report with notes', function () {
    $admin = User::factory()->admin()->create();
    $report = Report::factory()->create(['status' => ReportStatus::Pending]);

    $this->actingAs($admin)->post(route('admin.reports.resolve', $report), [
        'status' => 'resolved',
        'resolution_notes' => 'User was warned regarding duplicate listings.',
    ])->assertRedirect();

    expect($report->fresh()->status)->toBe(ReportStatus::Resolved)
        ->and($report->fresh()->resolved_by)->toBe($admin->id)
        ->and($report->fresh()->resolution_notes)->toBe('User was warned regarding duplicate listings.');

    $activity = Activity::inLog('hub')->where('event', HubEvent::ReportResolved->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue();
});

it('lists users with status and listing counts', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->student()->create();

    $this->actingAs($admin)->get(route('admin.users'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/users')
            ->has('users.data'));
});

it('lists pending and resolved reports', function () {
    $admin = User::factory()->admin()->create();
    Report::factory()->create(['status' => ReportStatus::Pending]);

    $this->actingAs($admin)->get(route('admin.reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/reports')
            ->has('reports.data'));
});
