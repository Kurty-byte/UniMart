<?php

use App\Actions\Shifts\CalculateShiftExpectedCash;
use App\Actions\Shifts\CloseShift;
use App\Actions\Shifts\OpenShift;
use App\Enums\HubEvent;
use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Spatie\Activitylog\Models\Activity;

it('opens a shift and records audit log', function () {
    $staff = User::factory()->staff()->create();

    $shift = app(OpenShift::class)->handle($staff, '1000.00');

    expect($shift->opening_cash)->toBe('1000.00')
        ->and($staff->activeShift()->id)->toBe($shift->id);

    $activity = Activity::inLog('hub')->where('event', HubEvent::ShiftOpened->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($staff))->toBeTrue();
});

it('prevents opening a new shift if an existing shift remains unclosed', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '1000.00');

    expect(fn () => app(OpenShift::class)->handle($staff, '500.00'))
        ->toThrow(ValidationException::class, 'You already have an active open shift.');
});

it('calculates expected cash based on sales and cash disbursements', function () {
    $staff = User::factory()->staff()->create();
    $shift = app(OpenShift::class)->handle($staff, '1000.00');

    // Simulate completed order handled by this staff
    Order::factory()->create([
        'handled_by' => $staff->id,
        'status' => OrderStatus::Completed,
        'total_price' => '300.00',
        'completed_at' => now(),
    ]);

    // Simulate cash payout disbursed by this staff
    OrderItem::factory()->create([
        'paid_by' => $staff->id,
        'payout_status' => PayoutStatus::CashClaimed,
        'price' => '100.00',
        'quantity' => 1,
        'paid_at' => now(),
    ]);

    $expected = app(CalculateShiftExpectedCash::class)->handle($shift);
    // 1000 (opening) + 300 (sales in) - 100 (cash out) = 1200.00
    expect($expected)->toBe('1200.00');
});

it('closes a shift and records discrepancy notes', function () {
    $staff = User::factory()->staff()->create();
    $shift = app(OpenShift::class)->handle($staff, '500.00');

    $closed = app(CloseShift::class)->handle($shift, '480.00', 'Short 20 pesos');

    expect($closed->shift_ended_at)->not->toBeNull()
        ->and($closed->expected_cash)->toBe('500.00')
        ->and($closed->actual_cash)->toBe('480.00')
        ->and($closed->notes)->toBe('Short 20 pesos');

    $activity = Activity::inLog('hub')->where('event', HubEvent::ShiftClosed->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($staff))->toBeTrue();
});
