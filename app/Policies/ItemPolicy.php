<?php

namespace App\Policies;

use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ItemPolicy
{
    /**
     * Determine whether the user can view any items.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create listings.
     */
    public function create(User $user): bool
    {
        return $user->can('item.create');
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
        return $user->can('item.update') && $user->id === $item->seller_id && $item->status === ItemStatus::PendingDropoff;
    }

    /**
     * Determine whether the user can delete the item listing.
     */
    public function delete(User $user, Item $item): bool
    {
        return $user->can('item.delete') && $user->id === $item->seller_id && $item->status === ItemStatus::PendingDropoff;
    }

    /**
     * Determine whether the user can view the item in the catalog.
     */
    public function viewInCatalog(User $user, Item $item): Response
    {
        if ($item->isInCatalog() || $item->seller_id === $user->id) {
            return Response::allow();
        }

        return Response::denyAsNotFound();
    }

    /**
     * Determine whether the user can approve a drop-off.
     */
    public function approveDropoff(User $user, Item $item): bool
    {
        return $user->can('item.dropoff.approve');
    }

    /**
     * Determine whether the user can reject a drop-off.
     */
    public function rejectDropoff(User $user, Item $item): bool
    {
        return $user->can('item.dropoff.reject');
    }

    /**
     * Determine whether the user can retrieve an expired item return.
     */
    public function retrieveReturn(User $user, Item $item): bool
    {
        return $user->can('item.return.retrieve');
    }

    /**
     * Determine whether the user can take down an item.
     */
    public function takeDown(User $user, Item $item): bool
    {
        return $user->can('item.takedown');
    }
}
