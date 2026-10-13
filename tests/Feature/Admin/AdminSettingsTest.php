<?php

use App\Enums\HubEvent;
use App\Enums\SettingKey;
use App\Models\Setting;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

it('renders admin settings page with current timers', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/settings')
            ->has('settings.cart_soft_hold_minutes')
            ->has('settings.order_hard_hold_hours')
            ->has('settings.item_shelf_expiry_days'));
});

it('allows admin to update system timers with validation', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->put(route('admin.settings.update'), [
        'cart_soft_hold_minutes' => 30,
        'order_hard_hold_hours' => 48,
        'item_shelf_expiry_days' => 60,
    ])->assertRedirect();

    expect(Setting::integer(SettingKey::CartSoftHoldMinutes))->toBe(30)
        ->and(Setting::integer(SettingKey::OrderHardHoldHours))->toBe(48)
        ->and(Setting::integer(SettingKey::ItemShelfExpiryDays))->toBe(60);

    $activity = Activity::inLog('hub')->where('event', HubEvent::SettingsUpdated->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue();
});

it('prevents non-admins from changing system settings', function () {
    $staff = User::factory()->staff()->create();
    $this->actingAs($staff)->put(route('admin.settings.update'), ['cart_soft_hold_minutes' => 30])
        ->assertForbidden();
});

it('validates settings timer bounds', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->put(route('admin.settings.update'), [
        'cart_soft_hold_minutes' => 2, // min is 5
        'order_hard_hold_hours' => 200, // max is 168
        'item_shelf_expiry_days' => 2, // min is 7
    ])->assertSessionHasErrors(['cart_soft_hold_minutes', 'order_hard_hold_hours', 'item_shelf_expiry_days']);
});
