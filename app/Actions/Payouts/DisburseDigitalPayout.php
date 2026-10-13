<?php

namespace App\Actions\Payouts;

use App\Enums\HubEvent;
use App\Enums\PayoutStatus;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\DigitalPayoutDisbursedNotification;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DisburseDigitalPayout
{
    /**
     * Disburse an item payout digitally via the seller's e-wallet QR code.
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

        if (! $seller || (! $seller->ewallet_qr_code && empty($seller->ewallet_account_number))) {
            throw ValidationException::withMessages([
                'seller' => ['Seller has not uploaded an e-wallet QR code or account details.'],
            ]);
        }

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
                'payout_status' => PayoutStatus::PaidDigitally,
                'paid_by' => $staff->id,
                'paid_at' => now(),
            ]);

            $seller->notify(new DigitalPayoutDisbursedNotification($lockedItem));

            HubAudit::record(
                HubEvent::PayoutDisbursedDigitally,
                $lockedItem,
                $staff,
                [
                    'amount' => $lockedItem->totalAmount(),
                    'seller_id' => $seller->id,
                ]
            );

            return $lockedItem->fresh(['item.seller', 'paidBy']);
        });
    }
}
