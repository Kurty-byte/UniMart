<?php

use App\Enums\ReportStatus;
use App\Models\Item;
use App\Models\Report;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

test('student can view their filed reports index page', function () {
    $student = User::factory()->student()->create();
    $other = User::factory()->student()->create();

    Report::factory()->create([
        'reporter_id' => $student->id,
        'reported_user_id' => $other->id,
        'reason' => 'Harassing chat messages',
        'status' => ReportStatus::Pending,
    ]);

    $this->actingAs($student)
        ->get(route('student.reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/reports')
            ->has('reports.data', 1)
            ->where('reports.data.0.reason', 'Harassing chat messages')
            ->where('reports.data.0.status', ReportStatus::Pending->value)
        );
});

test('student can submit a report against an item and it infers seller as reported user', function () {
    $seller = User::factory()->student()->create();
    $buyer = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create(['title' => 'Questionable Uniform']);

    $this->actingAs($buyer)
        ->from(route('student.browse'))
        ->post(route('student.reports.store'), [
            'item_id' => $item->id,
            'reason' => 'This item is not genuine campus merchandise.',
        ])
        ->assertRedirect(route('student.browse'))
        ->assertSessionHas('success');

    $report = Report::query()->first();
    expect($report)->not->toBeNull()
        ->and($report->reporter_id)->toBe($buyer->id)
        ->and($report->item_id)->toBe($item->id)
        ->and($report->reported_user_id)->toBe($seller->id)
        ->and($report->reason)->toBe('This item is not genuine campus merchandise.')
        ->and($report->status)->toBe(ReportStatus::Pending);

    expect(Activity::inLog('hub')->count())->toBeGreaterThanOrEqual(1);
});

test('student can submit a report against another user directly', function () {
    $reporter = User::factory()->student()->create();
    $target = User::factory()->student()->create();

    $this->actingAs($reporter)
        ->from(route('student.browse'))
        ->post(route('student.reports.store'), [
            'reported_user_id' => $target->id,
            'reason' => 'User sent inappropriate messages in private chat.',
        ])
        ->assertRedirect(route('student.browse'))
        ->assertSessionHas('success');

    $report = Report::query()->first();
    expect($report)->not->toBeNull()
        ->and($report->reporter_id)->toBe($reporter->id)
        ->and($report->reported_user_id)->toBe($target->id)
        ->and($report->item_id)->toBeNull()
        ->and($report->status)->toBe(ReportStatus::Pending);
});

test('student cannot report their own item listing', function () {
    $student = User::factory()->student()->create();
    $item = Item::factory()->for($student, 'seller')->create();

    $this->actingAs($student)
        ->post(route('student.reports.store'), [
            'item_id' => $item->id,
            'reason' => 'Reporting my own item',
        ])
        ->assertSessionHasErrors(['item_id']);

    expect(Report::count())->toBe(0);
});

test('student cannot report themselves directly', function () {
    $student = User::factory()->student()->create();

    $this->actingAs($student)
        ->post(route('student.reports.store'), [
            'reported_user_id' => $student->id,
            'reason' => 'Reporting myself',
        ])
        ->assertSessionHasErrors(['reported_user_id']);

    expect(Report::count())->toBe(0);
});

test('report requires at least an item or user target', function () {
    $student = User::factory()->student()->create();

    $this->actingAs($student)
        ->post(route('student.reports.store'), [
            'reason' => 'No target selected at all',
        ])
        ->assertSessionHasErrors(['report']);

    expect(Report::count())->toBe(0);
});

test('report requires a valid reason of at least 5 characters', function () {
    $student = User::factory()->student()->create();
    $target = User::factory()->student()->create();

    $this->actingAs($student)
        ->post(route('student.reports.store'), [
            'reported_user_id' => $target->id,
            'reason' => 'bad',
        ])
        ->assertSessionHasErrors(['reason']);

    expect(Report::count())->toBe(0);
});

test('guests are redirected to login', function () {
    $this->get(route('student.reports.index'))->assertRedirect(route('login'));
    $this->post(route('student.reports.store'), ['reason' => 'Some report'])->assertRedirect(route('login'));
});

test('staff members cannot access student report routes', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('student.reports.index'))->assertForbidden();
    $this->actingAs($staff)->post(route('student.reports.store'), ['reason' => 'Some report'])->assertForbidden();
});

test('throttles rapid report submissions', function () {
    $student = User::factory()->student()->create();
    $target = User::factory()->student()->create();

    for ($i = 0; $i < 5; $i++) {
        $this->actingAs($student)->post(route('student.reports.store'), [
            'reported_user_id' => $target->id,
            'reason' => "Spam report test attempt {$i}",
        ])->assertSessionHasNoErrors();
    }

    $this->actingAs($student)->post(route('student.reports.store'), [
        'reported_user_id' => $target->id,
        'reason' => 'Spam report attempt 6',
    ])->assertStatus(429);
});
