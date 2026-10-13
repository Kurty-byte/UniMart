<?php

use App\Enums\SettingKey;
use App\Models\Setting;

it('returns the default when no row exists', function () {
    expect(Setting::integer(SettingKey::CartSoftHoldMinutes))->toBe(15)
        ->and(Setting::integer(SettingKey::OrderHardHoldHours))->toBe(24)
        ->and(Setting::integer(SettingKey::ItemShelfExpiryDays))->toBe(30);
});

it('returns the stored value and refreshes the cache on put', function () {
    expect(Setting::integer(SettingKey::CartSoftHoldMinutes))->toBe(15); // warms cache

    Setting::put(SettingKey::CartSoftHoldMinutes, 20);

    expect(Setting::integer(SettingKey::CartSoftHoldMinutes))->toBe(20)
        ->and(Setting::where('key', 'cart_soft_hold_minutes')->value('value'))->toBe('20');
});

it('provides labels and validation rules for each setting key', function () {
    expect(SettingKey::CartSoftHoldMinutes->label())->toBeString()
        ->and(SettingKey::CartSoftHoldMinutes->rules())->toBeArray()
        ->and(SettingKey::OrderHardHoldHours->default())->toBe(24);
});
