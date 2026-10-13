<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view any orders.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('order.view_any');
    }

    /**
     * Determine whether the user can view the order.
     */
    public function view(User $user, Order $order): bool
    {
        return $order->buyer_id === $user->id || $user->can('order.view_any');
    }

    /**
     * Determine whether the user can create orders.
     */
    public function create(User $user): bool
    {
        return $user->can('order.create');
    }

    /**
     * Determine whether the user can cancel the order.
     */
    public function cancel(User $user, Order $order): bool
    {
        return ($user->can('order.cancel') && $order->buyer_id === $user->id) || $user->can('order.cancel_any');
    }

    /**
     * Determine whether the user can complete an order claim.
     */
    public function completeClaim(User $user, Order $order): bool
    {
        return $user->can('order.claim.complete');
    }
}
