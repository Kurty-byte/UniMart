<?php

use App\Actions\Payouts\DisburseDigitalPayout;
use App\Actions\Payouts\HoldCashPayout;
use App\Actions\Payouts\ReleaseCashPayout;
use App\Actions\Shifts\OpenShift;
use App\Enums\HubEvent;
use App\Enums\PayoutStatus;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\CashPayoutReadyNotification;
use App\Notifications\DigitalPayoutDisbursedNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Spatie\Activitylog\Models\Activity;

it('disburses payout digitally and logs the audit event', function () {
    Notification::fake();
    $staff = User::factory()->staff()->create();
    $seller = User::factory()->student()->create(['ewallet_qr_code' => 'qr/path.png']);
    $item = Item::factory()->for($seller, 'seller')->create();
    $orderItem = OrderItem::factory()->for($item)->create([
        'payout_status' => PayoutStatus::Pending,
        'price' => 250.00,
        'quantity' => 1,
    ]);

    app(DisburseDigitalPayout::class)->handle($staff, $orderItem);

    expect($orderItem->fresh()->payout_status)->toBe(PayoutStatus::PaidDigitally)
        ->and($orderItem->fresh()->paid_by)->toBe($staff->id)
        ->and($orderItem->fresh()->paid_at)->not->toBeNull();

    Notification::assertSentTo($seller, DigitalPayoutDisbursedNotification::class);

    $activity = Activity::inLog('hub')->where('event', HubEvent::PayoutDisbursedDigitally->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($staff))->toBeTrue();
});

it('refuses digital payout if seller has no e-wallet QR code', function () {
    $staff = User::factory()->staff()->create();
    $seller = User::factory()->student()->create(['ewallet_qr_code' => null]);
    $item = Item::factory()->for($seller, 'seller')->create();
    $orderItem = OrderItem::factory()->for($item)->create(['payout_status' => PayoutStatus::Pending]);

    expect(fn () => app(DisburseDigitalPayout::class)->handle($staff, $orderItem))
        ->toThrow(ValidationException::class);
});

it('disburses payout digitally if seller has mobile number even without QR code image', function () {
    Notification::fake();
    $staff = User::factory()->staff()->create();
    $seller = User::factory()->student()->create([
        'ewallet_qr_code' => null,
        'ewallet_provider' => 'gcash',
        'ewallet_account_number' => '09171234567',
    ]);
    $item = Item::factory()->for($seller, 'seller')->create();
    $orderItem = OrderItem::factory()->for($item)->create([
        'payout_status' => PayoutStatus::Pending,
        'price' => 250.00,
        'quantity' => 1,
    ]);

    app(DisburseDigitalPayout::class)->handle($staff, $orderItem);

    expect($orderItem->fresh()->payout_status)->toBe(PayoutStatus::PaidDigitally)
        ->and($orderItem->fresh()->paid_by)->toBe($staff->id)
        ->and($orderItem->fresh()->paid_at)->not->toBeNull();

    Notification::assertSentTo($seller, DigitalPayoutDisbursedNotification::class);
});

it('holds payout for cash and notifies seller', function () {
    Notification::fake();
    $staff = User::factory()->staff()->create();
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();
    $orderItem = OrderItem::factory()->for($item)->create(['payout_status' => PayoutStatus::Pending]);

    app(HoldCashPayout::class)->handle($staff, $orderItem);

    expect($orderItem->fresh()->payout_status)->toBe(PayoutStatus::CashHeld);
    Notification::assertSentTo($seller, CashPayoutReadyNotification::class);

    $activity = Activity::inLog('hub')->where('event', HubEvent::PayoutHeldForCash->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($staff))->toBeTrue();
});

it('releases held cash and records staff and timestamp', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '1000.00');

    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();
    $orderItem = OrderItem::factory()->for($item)->create(['payout_status' => PayoutStatus::CashHeld]);

    app(ReleaseCashPayout::class)->handle($staff, $orderItem);

    expect($orderItem->fresh()->payout_status)->toBe(PayoutStatus::CashClaimed)
        ->and($orderItem->fresh()->paid_by)->toBe($staff->id)
        ->and($orderItem->fresh()->paid_at)->not->toBeNull();

    $activity = Activity::inLog('hub')->where('event', HubEvent::CashPayoutReleased->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($staff))->toBeTrue();
});

it('refuses cash release if staff has no open shift', function () {
    $staff = User::factory()->staff()->create();
    $orderItem = OrderItem::factory()->create(['payout_status' => PayoutStatus::CashHeld]);

    expect(fn () => app(ReleaseCashPayout::class)->handle($staff, $orderItem))
        ->toThrow(ValidationException::class);
});

it('refuses cash release if payout is not cash held', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '1000.00');

    $orderItem = OrderItem::factory()->create(['payout_status' => PayoutStatus::Pending]);

    expect(fn () => app(ReleaseCashPayout::class)->handle($staff, $orderItem))
        ->toThrow(ValidationException::class);
});
