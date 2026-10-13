<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Enums\SettingKey;
use App\Models\Order;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CommitToBuy
{
    /**
     * Transition an active cart order into a pending handover hard-hold order.
     */
    public function handle(User $buyer, Order $cartOrder): Order
    {
        if ($cartOrder->buyer_id !== $buyer->id) {
            throw ValidationException::withMessages([
                'cart' => ['You do not own this cart.'],
            ]);
        }

        if ($cartOrder->status !== OrderStatus::Cart) {
            throw ValidationException::withMessages([
                'cart' => ['Order is not in cart status.'],
            ]);
        }

        return DB::transaction(function () use ($cartOrder) {
            /** @var Order|null $lockedCart */
            $lockedCart = Order::query()
                ->where('id', $cartOrder->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedCart || $lockedCart->status !== OrderStatus::Cart) {
                throw ValidationException::withMessages([
                    'cart' => ['The cart order could not be locked for checkout.'],
                ]);
            }

            if (! $lockedCart->orderItems()->exists()) {
                throw ValidationException::withMessages([
                    'cart' => ['Your cart is empty.'],
                ]);
            }

            if ($lockedCart->expires_at === null || $lockedCart->expires_at->isPast()) {
                throw ValidationException::withMessages([
                    'cart' => ['Your cart reservation has expired.'],
                ]);
            }

            $hardHoldHours = Setting::integer(SettingKey::OrderHardHoldHours, 24);

            $lockedCart->update([
                'status' => OrderStatus::PendingHandover,
                'claim_qr_code' => (string) Str::ulid(),
                'expires_at' => now()->addHours($hardHoldHours),
            ]);

            return $lockedCart->fresh(['orderItems.item']);
        });
    }
}
