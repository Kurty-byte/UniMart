<?php

namespace App\Actions\Staff;

use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Validation\ValidationException;

class RejectItemDropoff
{
    /**
     * Reject an item drop-off with a mandatory reason.
     */
    public function handle(User $staff, Item $item, string $reason): Item
    {
        if ($item->status !== ItemStatus::PendingDropoff) {
            throw ValidationException::withMessages([
                'item' => ['Only pending drop-off items can be rejected.'],
            ]);
        }

        $item->update([
            'status' => ItemStatus::Rejected,
            'rejection_reason' => $reason,
        ]);

        HubAudit::record(
            HubEvent::DropoffRejected,
            $item,
            $staff,
            ['reason' => $reason]
        );

        return $item->fresh();
    }
}
