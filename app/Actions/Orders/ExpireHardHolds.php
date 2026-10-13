<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use App\Notifications\OrderReservationExpiredNotification;
use Illuminate\Support\Facades\DB;

class ExpireHardHolds
{
    /**
     * Expire hard-hold orders whose claim countdown has elapsed.
     *
     * Restores stock and notifies the buyer.
     *
     * @return int Number of expired orders.
     */
    public function handle(): int
    {
        $expiredOrderIds = Order::query()
            ->where('status', OrderStatus::PendingHandover)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->pluck('id');

        $expiredCount = 0;

        foreach ($expiredOrderIds as $orderId) {
            $expiredOrder = DB::transaction(function () use ($orderId) {
                /** @var Order|null $lockedOrder */
                $lockedOrder = Order::query()
                    ->where('id', $orderId)
                    ->where('status', OrderStatus::PendingHandover)
                    ->where('expires_at', '<=', now())
                    ->lockForUpdate()
                    ->first();

                if (! $lockedOrder) {
                    return null;
                }

                $lockedOrder->load(['orderItems', 'buyer']);

                foreach ($lockedOrder->orderItems as $orderItem) {
                    /** @var Item|null $lockedItem */
                    $lockedItem = Item::query()
                        ->where('id', $orderItem->item_id)
                        ->lockForUpdate()
                        ->first();

                    if ($lockedItem) {
                        $lockedItem->increment('quantity', $orderItem->quantity);
                    }
                }

                $lockedOrder->update([
                    'status' => OrderStatus::Expired,
                ]);

                return $lockedOrder;
            });

            if ($expiredOrder) {
                $expiredCount++;

                if ($expiredOrder->buyer) {
                    $expiredOrder->buyer->notify(new OrderReservationExpiredNotification($expiredOrder));
                }
            }
        }

        return $expiredCount;
    }
}
