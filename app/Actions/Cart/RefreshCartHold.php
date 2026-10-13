<?php

namespace App\Actions\Cart;

use App\Enums\SettingKey;
use App\Models\Order;
use App\Models\Setting;

class RefreshCartHold
{
    /**
     * Extend rolling soft-hold expiry for an active cart order.
     *
     * Returns true if successfully refreshed, false if already expired.
     */
    public function handle(Order $cartOrder): bool
    {
        if ($cartOrder->expires_at === null || $cartOrder->expires_at->isPast()) {
            return false;
        }

        $minutes = Setting::integer(SettingKey::CartSoftHoldMinutes, 15);
        $cartOrder->update([
            'expires_at' => now()->addMinutes($minutes),
        ]);

        return true;
    }
}
