<?php

namespace App\Actions\Cart;

use App\Models\Item;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RemoveFromCart
{
    /**
     * Remove an item from the buyer's active cart and restore inventory.
     */
    public function handle(User $buyer, OrderItem $orderItem): void
    {
        $order = $orderItem->order;
        if (! $order || $order->buyer_id !== $buyer->id) {
            throw ValidationException::withMessages([
                'order_item' => ['You do not own this cart item.'],
            ]);
        }

        DB::transaction(function () use ($order, $orderItem) {
            /** @var Item|null $lockedItem */
            $lockedItem = Item::query()
                ->where('id', $orderItem->item_id)
                ->lockForUpdate()
                ->first();

            if ($lockedItem) {
                $lockedItem->increment('quantity', $orderItem->quantity);
            }

            $orderItem->delete();

            $order->recalculateTotal();
        });
    }
}
