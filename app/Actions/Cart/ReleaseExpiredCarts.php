<?php

namespace App\Actions\Cart;

use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class ReleaseExpiredCarts
{
    /**
     * Release expired cart holds, restore item inventory, and transition orders to Expired.
     *
     * @return int Number of released cart orders.
     */
    public function handle(): int
    {
        $expiredCartIds = Order::query()
            ->where('status', OrderStatus::Cart)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->pluck('id');

        $releasedCount = 0;

        foreach ($expiredCartIds as $cartId) {
            $released = DB::transaction(function () use ($cartId) {
                /** @var Order|null $cart */
                $cart = Order::query()
                    ->where('id', $cartId)
                    ->where('status', OrderStatus::Cart)
                    ->where('expires_at', '<=', now())
                    ->lockForUpdate()
                    ->first();

                if (! $cart) {
                    return false;
                }

                $cart->load('orderItems');

                foreach ($cart->orderItems as $orderItem) {
                    /** @var Item|null $lockedItem */
                    $lockedItem = Item::query()
                        ->where('id', $orderItem->item_id)
                        ->lockForUpdate()
                        ->first();

                    if ($lockedItem) {
                        $lockedItem->increment('quantity', $orderItem->quantity);
                    }
                }

                $cart->update([
                    'status' => OrderStatus::Expired,
                ]);

                return true;
            });

            if ($released) {
                $releasedCount++;
            }
        }

        return $releasedCount;
    }
}
