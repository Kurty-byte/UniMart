<?php

namespace App\Actions\Staff;

use App\Enums\HubEvent;
use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Enums\SettingKey;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\Setting;
use App\Notifications\ItemShelfExpiredNotification;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;

class ExpireShelfItems
{
    /**
     * Expire items that have reached their shelf life without active cart or handover reservations.
     */
    public function handle(): int
    {
        $shelfDays = Setting::integer(SettingKey::ItemShelfExpiryDays, 30);
        $cutoff = now()->subDays($shelfDays);

        $expiredCount = 0;

        $candidateItems = Item::query()
            ->where('status', ItemStatus::Available)
            ->whereNotNull('dropped_off_at')
            ->where('dropped_off_at', '<=', $cutoff)
            ->with('seller')
            ->get();

        foreach ($candidateItems as $item) {
            DB::transaction(function () use ($item, &$expiredCount) {
                /** @var Item|null $lockedItem */
                $lockedItem = Item::query()
                    ->where('id', $item->id)
                    ->lockForUpdate()
                    ->first();

                if (! $lockedItem || $lockedItem->status !== ItemStatus::Available) {
                    return;
                }

                $hasActiveReservations = OrderItem::query()
                    ->where('item_id', $lockedItem->id)
                    ->whereHas('order', fn ($q) => $q->whereIn('status', [OrderStatus::Cart, OrderStatus::PendingHandover]))
                    ->exists();

                if ($hasActiveReservations) {
                    return;
                }

                $lockedItem->update([
                    'status' => ItemStatus::Expired,
                ]);

                if ($lockedItem->seller) {
                    $lockedItem->seller->notify(new ItemShelfExpiredNotification($lockedItem));
                }

                HubAudit::record(
                    HubEvent::ItemExpired,
                    $lockedItem,
                    null,
                    [
                        'seller_id' => $lockedItem->seller_id,
                        'shelf_location' => $lockedItem->shelf_location,
                    ]
                );

                $expiredCount++;
            });
        }

        return $expiredCount;
    }
}
