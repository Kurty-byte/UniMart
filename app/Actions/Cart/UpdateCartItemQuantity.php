<?php

namespace App\Actions\Cart;

use App\Enums\SettingKey;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateCartItemQuantity
{
    /**
     * Update an order item quantity within the buyer's active cart.
     */
    public function handle(User $buyer, OrderItem $orderItem, int $newQuantity): OrderItem
    {
        if ($newQuantity < 1) {
            throw ValidationException::withMessages([
                'quantity' => ['The quantity must be at least 1.'],
            ]);
        }

        $order = $orderItem->order;
        if (! $order || $order->buyer_id !== $buyer->id) {
            throw ValidationException::withMessages([
                'order_item' => ['You do not own this cart item.'],
            ]);
        }

        return DB::transaction(function () use ($order, $orderItem, $newQuantity) {
            /** @var Item|null $lockedItem */
            $lockedItem = Item::query()
                ->where('id', $orderItem->item_id)
                ->lockForUpdate()
                ->first();

            if (! $lockedItem) {
                throw ValidationException::withMessages([
                    'item' => ['The item no longer exists.'],
                ]);
            }

            $currentQuantity = $orderItem->quantity;
            $diff = $newQuantity - $currentQuantity;

            if ($diff > 0) {
                // Increasing quantity: check if enough additional stock exists
                if ($lockedItem->quantity < $diff) {
                    throw ValidationException::withMessages([
                        'quantity' => ['The requested quantity is no longer available.'],
                    ]);
                }
                $lockedItem->decrement('quantity', $diff);
            } elseif ($diff < 0) {
                // Decreasing quantity: restore stock
                $lockedItem->increment('quantity', abs($diff));
            }

            $orderItem->update([
                'quantity' => $newQuantity,
                'price' => $lockedItem->price,
            ]);

            // Extend hold timer
            $minutes = Setting::integer(SettingKey::CartSoftHoldMinutes, 15);
            $order->update([
                'expires_at' => now()->addMinutes($minutes),
            ]);

            $order->recalculateTotal();

            return $orderItem->fresh(['order', 'item']);
        });
    }
}
