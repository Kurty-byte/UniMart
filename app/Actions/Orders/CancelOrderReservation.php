<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CancelOrderReservation
{
    /**
     * Cancel a pending handover reservation and restore item stock.
     */
    public function handle(User $buyer, Order $order): void
    {
        if ($order->buyer_id !== $buyer->id) {
            throw ValidationException::withMessages([
                'order' => ['You do not own this reservation.'],
            ]);
        }

        if ($order->status !== OrderStatus::PendingHandover) {
            throw ValidationException::withMessages([
                'order' => ['Only pending reservations can be cancelled.'],
            ]);
        }

        DB::transaction(function () use ($order) {
            /** @var Order|null $lockedOrder */
            $lockedOrder = Order::query()
                ->where('id', $order->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedOrder || $lockedOrder->status !== OrderStatus::PendingHandover) {
                throw ValidationException::withMessages([
                    'order' => ['The reservation cannot be cancelled at this time.'],
                ]);
            }

            $lockedOrder->load('orderItems');

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
                'status' => OrderStatus::Cancelled,
            ]);
        });
    }
}
