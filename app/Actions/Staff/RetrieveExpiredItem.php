<?php

namespace App\Actions\Staff;

use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Validation\ValidationException;

class RetrieveExpiredItem
{
    /**
     * Mark an expired consignment item as retrieved by its original owner.
     */
    public function handle(User $staff, Item $item): Item
    {
        if ($item->status !== ItemStatus::Expired) {
            throw ValidationException::withMessages([
                'item' => ['Only expired items can be retrieved by their owner.'],
            ]);
        }

        $item->update([
            'status' => ItemStatus::Retrieved,
        ]);

        HubAudit::record(
            HubEvent::ItemRetrieved,
            $item,
            $staff,
            [
                'seller_id' => $item->seller_id,
                'title' => $item->title,
            ]
        );

        return $item->fresh();
    }
}
