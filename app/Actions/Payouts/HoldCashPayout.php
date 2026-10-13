<?php

namespace App\Actions\Payouts;

use App\Enums\HubEvent;
use App\Enums\PayoutStatus;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\CashPayoutReadyNotification;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HoldCashPayout
{
    /**
     * Mark an item payout as held in cash at the Hub desk and notify the seller.
     */
    public function handle(User $staff, OrderItem $orderItem): OrderItem
    {
        if ($orderItem->payout_status !== PayoutStatus::Pending) {
            throw ValidationException::withMessages([
                'orderItem' => ['Payout is not in pending status.'],
            ]);
        }

        $orderItem->loadMissing('item.seller');
        $seller = $orderItem->seller();

        return DB::transaction(function () use ($staff, $orderItem, $seller) {
            /** @var OrderItem|null $lockedItem */
            $lockedItem = OrderItem::query()
                ->where('id', $orderItem->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedItem || $lockedItem->payout_status !== PayoutStatus::Pending) {
                throw ValidationException::withMessages([
                    'orderItem' => ['Payout is not in pending status.'],
                ]);
            }

            $lockedItem->update([
                'payout_status' => PayoutStatus::CashHeld,
            ]);

            if ($seller) {
                $seller->notify(new CashPayoutReadyNotification($lockedItem));
            }

            HubAudit::record(
                HubEvent::PayoutHeldForCash,
                $lockedItem,
                $staff,
                [
                    'amount' => $lockedItem->totalAmount(),
                    'seller_id' => $seller?->id,
                ]
            );

            return $lockedItem->fresh(['item.seller']);
        });
    }
}
