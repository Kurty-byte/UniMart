<?php

namespace App\Actions\Admin;

use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Validation\ValidationException;

class TakeDownItem
{
    /**
     * Manually take down an item from the catalog.
     */
    public function handle(User $admin, Item $item, ?string $reason = null): Item
    {
        $hasActiveClaim = OrderItem::query()
            ->where('item_id', $item->id)
            ->whereHas('order', fn ($q) => $q->where('status', OrderStatus::PendingHandover))
            ->exists();

        if ($hasActiveClaim) {
            throw ValidationException::withMessages([
                'item' => ['Cannot take down an item that is currently reserved in an active pickup claim.'],
            ]);
        }

        $item->update([
            'status' => ItemStatus::Expired,
            'rejection_reason' => $reason,
        ]);

        HubAudit::record(
            HubEvent::ItemTakenDown,
            $item,
            $admin,
            [
                'reason' => $reason,
                'title' => $item->title,
            ]
        );

        return $item->fresh();
    }
}
