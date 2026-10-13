<?php

namespace App\Actions\Cart;

use App\Enums\PayoutStatus;
use App\Enums\SettingKey;
use App\Models\Item;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AddToCart
{
    /**
     * Add an item to the buyer's active cart with soft-hold reservation.
     */
    public function handle(User $buyer, Item $item, int $quantity = 1): OrderItem
    {
        if ($item->seller_id === $buyer->id) {
            throw ValidationException::withMessages([
                'item' => ['You cannot purchase your own listing.'],
            ]);
        }

        if ($quantity < 1) {
            throw ValidationException::withMessages([
                'quantity' => ['The quantity must be at least 1.'],
            ]);
        }

        return DB::transaction(function () use ($buyer, $item, $quantity) {
            // Row lock the item for atomic quantity reservation
            /** @var Item|null $lockedItem */
            $lockedItem = Item::query()
                ->where('id', $item->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedItem || $lockedItem->quantity < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => ['The requested quantity is no longer available.'],
                ]);
            }

            $cart = Order::findOrCreateCart($buyer);

            // Extend soft hold expiration
            $minutes = Setting::integer(SettingKey::CartSoftHoldMinutes, 15);
            $cart->update([
                'expires_at' => now()->addMinutes($minutes),
            ]);

            // Decrement available stock
            $lockedItem->decrement('quantity', $quantity);

            // Find existing order item or create new one
            /** @var OrderItem|null $orderItem */
            $orderItem = OrderItem::query()
                ->where('order_id', $cart->id)
                ->where('item_id', $lockedItem->id)
                ->first();

            if ($orderItem) {
                $orderItem->increment('quantity', $quantity);
                $orderItem->update(['price' => $lockedItem->price]);
            } else {
                $orderItem = OrderItem::create([
                    'order_id' => $cart->id,
                    'item_id' => $lockedItem->id,
                    'quantity' => $quantity,
                    'price' => $lockedItem->price,
                    'payout_status' => PayoutStatus::Pending,
                ]);
            }

            $cart->recalculateTotal();

            return $orderItem->load('order');
        });
    }
}
