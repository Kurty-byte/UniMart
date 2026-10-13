<?php

namespace App\Actions\Staff;

use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Validation\ValidationException;

class ApproveItemDropoff
{
    /**
     * Approve an item drop-off, assign shelf location, and make it available.
     */
    public function handle(User $staff, Item $item, string $shelfLocation): Item
    {
        if ($item->status !== ItemStatus::PendingDropoff) {
            throw ValidationException::withMessages([
                'item' => ['Only pending drop-off items can be approved.'],
            ]);
        }

        $item->update([
            'status' => ItemStatus::Available,
            'shelf_location' => $shelfLocation,
            'dropped_off_at' => now(),
        ]);

        HubAudit::record(
            HubEvent::DropoffApproved,
            $item,
            $staff,
            ['shelf_location' => $shelfLocation]
        );

        return $item->fresh();
    }
}
