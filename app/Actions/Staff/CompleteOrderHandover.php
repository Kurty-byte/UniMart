<?php

namespace App\Actions\Staff;

use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompleteOrderHandover
{
    /**
     * Complete physical order handover and cash intake at the campus hub desk.
     */
    public function handle(User $staff, Order $order): Order
    {
        if (! $staff->hasOpenShift()) {
            throw ValidationException::withMessages([
                'shift' => ['Staff must have an open shift to complete order handovers.'],
            ]);
        }

        if ($order->status !== OrderStatus::PendingHandover) {
            throw ValidationException::withMessages([
                'order' => ['Order is not pending handover.'],
            ]);
        }

        if ($order->expires_at !== null && $order->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'order' => ['Order reservation claim has expired.'],
            ]);
        }

        return DB::transaction(function () use ($staff, $order) {
            /** @var Order|null $lockedOrder */
            $lockedOrder = Order::query()
                ->where('id', $order->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedOrder || $lockedOrder->status !== OrderStatus::PendingHandover) {
                throw ValidationException::withMessages([
                    'order' => ['Order is not available for handover.'],
                ]);
            }

            if ($lockedOrder->expires_at !== null && $lockedOrder->expires_at->isPast()) {
                throw ValidationException::withMessages([
                    'order' => ['Order reservation claim has expired.'],
                ]);
            }

            $lockedOrder->update([
                'status' => OrderStatus::Completed,
                'completed_at' => now(),
                'handled_by' => $staff->id,
            ]);

            // Set each order item's payout status to Pending
            $lockedOrder->orderItems()->update([
                'payout_status' => PayoutStatus::Pending,
            ]);

            // Load items to check inventory remaining status
            $orderItems = $lockedOrder->orderItems()->with('item')->get();

            foreach ($orderItems as $orderItem) {
                $item = $orderItem->item;
                if (! $item) {
                    continue;
                }

                if ($item->quantity === 0) {
                    $hasOtherPendingOrders = OrderItem::query()
                        ->where('item_id', $item->id)
                        ->where('order_id', '!=', $lockedOrder->id)
                        ->whereHas('order', fn ($q) => $q->whereIn('status', [OrderStatus::Cart, OrderStatus::PendingHandover]))
                        ->exists();

                    if (! $hasOtherPendingOrders) {
                        $item->update(['status' => ItemStatus::Sold]);
                    }
                }
            }

            HubAudit::record(
                HubEvent::ClaimCompleted,
                $lockedOrder,
                $staff,
                ['amount' => (string) $lockedOrder->total_price]
            );

            return $lockedOrder->fresh(['orderItems.item', 'buyer', 'handledBy']);
        });
    }
}
