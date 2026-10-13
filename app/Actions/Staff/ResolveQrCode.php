<?php

namespace App\Actions\Staff;

use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Models\Item;
use App\Models\Order;
use Illuminate\Validation\ValidationException;

class ResolveQrCode
{
    /**
     * Resolve a scanned QR code (ULID) to an item drop-off, order claim, or item retrieval.
     *
     * @return array{type: 'dropoff'|'claim'|'retrieval', record: Item|Order, actions: array<string>}
     */
    public function handle(string $code): array
    {
        // Check if code matches an item dropoff_qr_code
        $item = Item::query()->where('dropoff_qr_code', $code)->first();

        if ($item) {
            if ($item->status === ItemStatus::PendingDropoff) {
                return [
                    'type' => 'dropoff',
                    'record' => $item,
                    'actions' => ['approve', 'reject'],
                ];
            }

            if ($item->status === ItemStatus::Expired) {
                return [
                    'type' => 'retrieval',
                    'record' => $item,
                    'actions' => ['retrieve'],
                ];
            }

            return [
                'type' => 'dropoff',
                'record' => $item,
                'actions' => [],
            ];
        }

        // Check if code matches an order claim_qr_code
        $order = Order::query()->where('claim_qr_code', $code)->first();

        if ($order) {
            return [
                'type' => 'claim',
                'record' => $order,
                'actions' => $order->status === OrderStatus::PendingHandover ? ['complete'] : [],
            ];
        }

        throw ValidationException::withMessages([
            'code' => ['The scanned QR code is unrecognized.'],
        ]);
    }
}
