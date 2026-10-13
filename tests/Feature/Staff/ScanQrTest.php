<?php

use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;

it('resolves a drop-off QR code to a pending item', function () {
    $staff = User::factory()->staff()->create();
    $item = Item::factory()->pendingDropoff()->create();

    $this->actingAs($staff)->postJson(route('staff.scan.resolve'), ['code' => $item->dropoff_qr_code])
        ->assertOk()
        ->assertJson([
            'type' => 'dropoff',
            'item' => ['id' => $item->id, 'title' => $item->title],
        ]);
});

it('resolves a claim QR code to a pending handover order', function () {
    $staff = User::factory()->staff()->create();
    $order = Order::factory()->create(['status' => OrderStatus::PendingHandover]);

    $this->actingAs($staff)->postJson(route('staff.scan.resolve'), ['code' => $order->claim_qr_code])
        ->assertOk()
        ->assertJson([
            'type' => 'claim',
            'order' => ['id' => $order->id, 'total_price' => $order->total_price],
        ]);
});

it('resolves an expired item dropoff QR code as retrieval', function () {
    $staff = User::factory()->staff()->create();
    $item = Item::factory()->expired()->create();

    $this->actingAs($staff)->postJson(route('staff.scan.resolve'), ['code' => $item->dropoff_qr_code])
        ->assertOk()
        ->assertJson([
            'type' => 'retrieval',
            'item' => ['id' => $item->id, 'title' => $item->title],
        ]);
});

it('returns 422 if the scanned QR code is unrecognized', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->postJson(route('staff.scan.resolve'), ['code' => 'UNKNOWN_CODE_123456789'])
        ->assertUnprocessable();
});

it('forbids users without scan qr codes permission', function () {
    $student = User::factory()->student()->create();

    $this->actingAs($student)->postJson(route('staff.scan.resolve'), ['code' => 'ANY_CODE'])
        ->assertForbidden();
});
