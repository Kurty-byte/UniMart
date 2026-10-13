<?php

namespace App\Actions\Admin;

use App\Enums\HubEvent;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;

class SuspendUser
{
    /**
     * Suspend a user, release any active reservations, and log the action.
     */
    public function handle(User $admin, User $target): void
    {
        DB::transaction(function () use ($admin, $target) {
            $target->update(['suspended_at' => now()]);

            $activeOrders = Order::query()
                ->where('buyer_id', $target->id)
                ->whereIn('status', [OrderStatus::Cart, OrderStatus::PendingHandover])
                ->lockForUpdate()
                ->get();

            foreach ($activeOrders as $order) {
                $order->load('orderItems');
                foreach ($order->orderItems as $orderItem) {
                    /** @var Item|null $lockedItem */
                    $lockedItem = Item::query()
                        ->where('id', $orderItem->item_id)
                        ->lockForUpdate()
                        ->first();

                    if ($lockedItem) {
                        $lockedItem->increment('quantity', $orderItem->quantity);
                    }
                }

                $order->update([
                    'status' => OrderStatus::Cancelled,
                ]);
            }

            HubAudit::record(
                HubEvent::UserSuspended,
                $target,
                $admin,
                ['email' => $target->email]
            );
        });
    }
}
