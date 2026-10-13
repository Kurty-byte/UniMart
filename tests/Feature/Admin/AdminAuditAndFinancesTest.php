<?php

use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Models\DrawerCount;
use App\Models\Item;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Support\HubAudit;
use Inertia\Testing\AssertableInertia as Assert;

it('displays shift audits with expected vs actual discrepancies', function () {
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();
    DrawerCount::factory()->create([
        'staff_id' => $staff->id,
        'opening_cash' => '500.00',
        'expected_cash' => '800.00',
        'actual_cash' => '750.00',
        'shift_ended_at' => now(),
    ]);

    $this->actingAs($admin)->get(route('admin.shift-audits'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/shift-audits')
            ->has('shifts.data', 1));
});

it('displays financial metrics and hub activity audit logs', function () {
    $admin = User::factory()->admin()->create();
    $item = Item::factory()->create();
    HubAudit::record(HubEvent::ClaimCompleted, $item, $admin, ['amount' => '300.00']);

    $this->actingAs($admin)->get(route('admin.finances'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/finances')
            ->has('metrics')
            ->has('auditLogs.data', 1));
});

it('allows admin to take down an unsold item', function () {
    $admin = User::factory()->admin()->create();
    $item = Item::factory()->create(['status' => ItemStatus::Available]);

    $this->actingAs($admin)->post(route('admin.inventory.take-down', $item))
        ->assertRedirect();

    expect($item->fresh()->status)->toBe(ItemStatus::Expired);
});

it('refuses to take down item currently locked in active claim', function () {
    $admin = User::factory()->admin()->create();
    $item = Item::factory()->create(['status' => ItemStatus::Available]);
    $order = Order::factory()->create(['status' => OrderStatus::PendingHandover]);
    OrderItem::factory()->for($order)->for($item)->create();

    $this->actingAs($admin)->post(route('admin.inventory.take-down', $item))
        ->assertSessionHasErrors('item');
});

it('renders admin inventory page with items list', function () {
    $admin = User::factory()->admin()->create();
    Item::factory()->count(2)->create();

    $this->actingAs($admin)->get(route('admin.inventory'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/inventory')
            ->has('items.data', 2));
});
