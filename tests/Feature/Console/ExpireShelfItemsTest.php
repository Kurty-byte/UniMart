<?php

use App\Actions\Cart\AddToCart;
use App\Enums\ItemStatus;
use App\Enums\SettingKey;
use App\Models\Item;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\ItemShelfExpiredNotification;
use Illuminate\Support\Facades\Notification;

it('expires items that exceeded shelf life without active reservations', function () {
    Notification::fake();
    Setting::put(SettingKey::ItemShelfExpiryDays, 30);

    $seller = User::factory()->student()->create();
    $oldItem = Item::factory()->for($seller, 'seller')->create([
        'status' => ItemStatus::Available,
        'quantity' => 2,
        'dropped_off_at' => now()->subDays(31),
    ]);

    $this->artisan('unimart:expire-shelf-items')->assertSuccessful();

    expect($oldItem->fresh()->status)->toBe(ItemStatus::Expired);
    Notification::assertSentTo($seller, ItemShelfExpiredNotification::class);
});

it('does not expire items within shelf life', function () {
    Notification::fake();
    Setting::put(SettingKey::ItemShelfExpiryDays, 30);

    $seller = User::factory()->student()->create();
    $recentItem = Item::factory()->for($seller, 'seller')->create([
        'status' => ItemStatus::Available,
        'quantity' => 1,
        'dropped_off_at' => now()->subDays(10),
    ]);

    $this->artisan('unimart:expire-shelf-items')->assertSuccessful();

    expect($recentItem->fresh()->status)->toBe(ItemStatus::Available);
    Notification::assertNothingSent();
});

it('does not expire items held in active carts or reservations', function () {
    Notification::fake();
    Setting::put(SettingKey::ItemShelfExpiryDays, 30);

    $seller = User::factory()->student()->create();
    $oldItem = Item::factory()->for($seller, 'seller')->create([
        'status' => ItemStatus::Available,
        'quantity' => 2,
        'dropped_off_at' => now()->subDays(35),
    ]);

    $buyer = User::factory()->student()->create();
    app(AddToCart::class)->handle($buyer, $oldItem, 1);

    $this->artisan('unimart:expire-shelf-items')->assertSuccessful();

    expect($oldItem->fresh()->status)->toBe(ItemStatus::Available);
    Notification::assertNothingSent();
});
