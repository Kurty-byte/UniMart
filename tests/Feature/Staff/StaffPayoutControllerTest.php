<?php

use App\Actions\Shifts\OpenShift;
use App\Enums\PayoutStatus;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('displays pending payouts and held cash items to staff', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '1000.00');
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();

    OrderItem::factory()->for($item)->create(['payout_status' => PayoutStatus::Pending]);
    OrderItem::factory()->for($item)->create(['payout_status' => PayoutStatus::CashHeld]);

    $this->actingAs($staff)->get(route('staff.payouts'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('staff/payouts')
            ->has('pendingPayouts', 1)
            ->has('heldCashPayouts', 1)
            ->has('recentDisbursements'));
});

it('prevents non-staff from accessing staff payouts', function () {
    $student = User::factory()->student()->create();
    $this->actingAs($student)->get(route('staff.payouts'))->assertForbidden();
});

it('disburses digital payout via controller endpoint', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '1000.00');
    $seller = User::factory()->student()->create(['ewallet_qr_code' => 'qr/path.png']);
    $item = Item::factory()->for($seller, 'seller')->create();
    $orderItem = OrderItem::factory()->for($item)->create(['payout_status' => PayoutStatus::Pending]);

    $this->actingAs($staff)->post(route('staff.payouts.digital', $orderItem))
        ->assertRedirect();

    expect($orderItem->fresh()->payout_status)->toBe(PayoutStatus::PaidDigitally)
        ->and($orderItem->fresh()->paid_by)->toBe($staff->id);
});

it('holds cash payout via controller endpoint', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '1000.00');
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();
    $orderItem = OrderItem::factory()->for($item)->create(['payout_status' => PayoutStatus::Pending]);

    $this->actingAs($staff)->post(route('staff.payouts.hold', $orderItem))
        ->assertRedirect();

    expect($orderItem->fresh()->payout_status)->toBe(PayoutStatus::CashHeld);
});

it('releases cash payout via controller endpoint with open shift', function () {
    $staff = User::factory()->staff()->create();
    app(OpenShift::class)->handle($staff, '1000.00');

    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();
    $orderItem = OrderItem::factory()->for($item)->create(['payout_status' => PayoutStatus::CashHeld]);

    $this->actingAs($staff)->post(route('staff.payouts.release', $orderItem))
        ->assertRedirect();

    expect($orderItem->fresh()->payout_status)->toBe(PayoutStatus::CashClaimed)
        ->and($orderItem->fresh()->paid_by)->toBe($staff->id);
});

it('prevents releasing cash payout without open shift', function () {
    $staff = User::factory()->staff()->create();
    $orderItem = OrderItem::factory()->create(['payout_status' => PayoutStatus::CashHeld]);

    $this->actingAs($staff)->post(route('staff.payouts.release', $orderItem))
        ->assertRedirect(route('staff.drawer-count'));
});
