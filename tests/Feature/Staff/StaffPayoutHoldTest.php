<?php

use App\Actions\Shifts\OpenShift;
use App\Enums\HubEvent;
use App\Enums\PayoutHoldReason;
use App\Enums\PayoutStatus;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\CashPayoutReadyNotification;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

it('lets staff hold cash with fixed_amount_qr reason and sends tailored notification', function () {
    Notification::fake();
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '1000.00');
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create(['title' => 'PE Uniform XL']);
    $orderItem = OrderItem::factory()->for($item)->create([
        'payout_status' => PayoutStatus::Pending,
        'price' => 350.00,
        'quantity' => 1,
    ]);

    $this->actingAs($staff)->post(route('staff.payouts.hold', $orderItem), [
        'reason' => PayoutHoldReason::FixedAmountQr->value,
        'note' => 'Fixed 500 PHP embedded in QR image',
    ])->assertRedirect();

    $freshItem = $orderItem->fresh();
    expect($freshItem->payout_status)->toBe(PayoutStatus::CashHeld)
        ->and($freshItem->payout_hold_reason)->toBe(PayoutHoldReason::FixedAmountQr)
        ->and($freshItem->payout_note)->toBe('Fixed 500 PHP embedded in QR image');

    Notification::assertSentTo($seller, CashPayoutReadyNotification::class, function ($notification) use ($orderItem) {
        $data = $notification->toArray($orderItem->item->seller);

        return str_contains($data['message'], 'locked/fixed amount')
            && str_contains($data['message'], 'PE Uniform XL')
            && str_contains($data['message'], '350.00');
    });

    $activity = Activity::inLog('hub')->where('event', HubEvent::PayoutHeldForCash->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->properties['reason'])->toBe(PayoutHoldReason::FixedAmountQr->value)
        ->and($activity->properties['note'])->toBe('Fixed 500 PHP embedded in QR image');
});

it('renders seller account redundancy and hold reasons on staff payouts index', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '1000.00');
    $seller = User::factory()->student()->create([
        'ewallet_provider' => 'gcash',
        'ewallet_account_name' => 'Juan Dela Cruz',
        'ewallet_account_number' => '09171234567',
        'ewallet_qr_code' => 'ewallet-qr/seller.png',
    ]);
    $item = Item::factory()->for($seller, 'seller')->create();
    $pendingOi = OrderItem::factory()->for($item)->create(['payout_status' => PayoutStatus::Pending]);

    $heldOi = OrderItem::factory()->for($item)->create([
        'payout_status' => PayoutStatus::CashHeld,
        'payout_hold_reason' => PayoutHoldReason::FixedAmountQr,
        'payout_note' => 'Fixed amount embedded',
    ]);

    $this->actingAs($staff)->get(route('staff.payouts'))
        ->assertInertia(fn (Assert $page) => $page->component('staff/payouts')
            ->has('pendingPayouts.0.seller', fn (Assert $s) => $s
                ->where('ewallet_provider', 'gcash')
                ->where('ewallet_account_name', 'Juan Dela Cruz')
                ->where('ewallet_account_number', '09171234567')
                ->where('has_ewallet_qr', true)
                ->etc())
            ->has('heldCashPayouts.0', fn (Assert $h) => $h
                ->where('payout_hold_reason', 'fixed_amount_qr')
                ->where('payout_hold_reason_label', 'QR code contains a locked/fixed amount')
                ->where('payout_note', 'Fixed amount embedded')
                ->etc()));
});

it('renders hold reasons on student payouts dashboard', function () {
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create(['title' => 'Lab Gown']);
    $heldOi = OrderItem::factory()->for($item)->create([
        'payout_status' => PayoutStatus::CashHeld,
        'payout_hold_reason' => PayoutHoldReason::FixedAmountQr,
        'payout_note' => 'Fixed amount in GCash QR',
    ]);

    $this->actingAs($seller)->get(route('student.payouts'))
        ->assertInertia(fn (Assert $page) => $page->component('student/payouts')
            ->has('payouts.data.0', fn (Assert $p) => $p
                ->where('payout_hold_reason', 'fixed_amount_qr')
                ->where('payout_note', 'Fixed amount in GCash QR')
                ->etc()));
});
