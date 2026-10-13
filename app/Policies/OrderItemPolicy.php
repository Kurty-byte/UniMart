<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Models\OrderItem;
use App\Models\User;

class OrderItemPolicy
{
    /**
     * Determine whether the user can update the cart order item quantity.
     */
    public function update(User $user, OrderItem $orderItem): bool
    {
        return $orderItem->order
            && $orderItem->order->buyer_id === $user->id
            && $orderItem->order->status === OrderStatus::Cart;
    }

    /**
     * Determine whether the user can process payouts for this order item.
     */
    public function processPayout(User $user, OrderItem $orderItem): bool
    {
        return $user->can('payout.process');
    }

    /**
     * Determine whether the user can hold payouts for this order item.
     */
    public function holdPayout(User $user, OrderItem $orderItem): bool
    {
        return $user->can('payout.process') || $user->can('payout.hold');
    }

    /**
     * Determine whether the user can release payouts for this order item.
     */
    public function releasePayout(User $user, OrderItem $orderItem): bool
    {
        return $user->can('payout.process') || $user->can('payout.release');
    }
}
