<?php

namespace App\Policies;

use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;

class ItemPolicy
{
    /**
     * Determine whether the user can create listings.
     */
    public function create(User $user): bool
    {
        return $user->can('create listings');
    }

    /**
     * Determine whether the user can view the item listing.
     */
    public function view(User $user, Item $item): bool
    {
        return $user->id === $item->seller_id;
    }

    /**
     * Determine whether the user can update the item listing.
     */
    public function update(User $user, Item $item): bool
    {
        return $user->id === $item->seller_id && $item->status === ItemStatus::PendingDropoff;
    }

    /**
     * Determine whether the user can delete the item listing.
     */
    public function delete(User $user, Item $item): bool
    {
        return $user->id === $item->seller_id && $item->status === ItemStatus::PendingDropoff;
    }
}
