<?php

namespace App\Actions\Payouts;

use App\Enums\HubEvent;
use App\Enums\PayoutStatus;
use App\Models\OrderItem;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReleaseCashPayout
{
    /**
     * Release held cash payout to seller at the Hub desk.
     */
    public function handle(User $staff, OrderItem $orderItem): OrderItem
    {
        if (! $staff->hasOpenShift()) {
            throw ValidationException::withMessages([
                'shift' => ['Staff must have an open shift to release cash payouts.'],
            ]);
        }

        if ($orderItem->payout_status !== PayoutStatus::CashHeld) {
            throw ValidationException::withMessages([
                'orderItem' => ['Payout must be held in cash before release.'],
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

            if (! $lockedItem || $lockedItem->payout_status !== PayoutStatus::CashHeld) {
                throw ValidationException::withMessages([
                    'orderItem' => ['Payout must be held in cash before release.'],
                ]);
            }

            $lockedItem->update([
                'payout_status' => PayoutStatus::CashClaimed,
                'paid_by' => $staff->id,
                'paid_at' => now(),
            ]);

            HubAudit::record(
                HubEvent::CashPayoutReleased,
                $lockedItem,
                $staff,
                [
                    'amount' => $lockedItem->totalAmount(),
                    'seller_id' => $seller?->id,
                ]
            );

            return $lockedItem->fresh(['item.seller', 'paidBy']);
        });
    }
}
