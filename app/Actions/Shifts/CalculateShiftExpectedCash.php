<?php

namespace App\Actions\Shifts;

use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Models\DrawerCount;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class CalculateShiftExpectedCash
{
    /**
     * Calculate expected cash for the given shift based on sales taken in minus cash disbursed.
     */
    public function handle(DrawerCount $shift): string
    {
        $staffId = $shift->staff_id;
        $shiftStart = $shift->shift_started_at;
        $shiftEnd = $shift->shift_ended_at ?? now();

        // Cash taken in from orders completed by this staff during shift
        $cashIn = Order::query()
            ->where('handled_by', $staffId)
            ->where('status', OrderStatus::Completed)
            ->whereBetween('completed_at', [$shiftStart, $shiftEnd])
            ->sum('total_price');

        // Cash disbursed for cash payouts disbursed by this staff during shift
        $cashOut = OrderItem::query()
            ->where('paid_by', $staffId)
            ->where('payout_status', PayoutStatus::CashClaimed)
            ->whereBetween('paid_at', [$shiftStart, $shiftEnd])
            ->sum(DB::raw('price * quantity'));

        $opening = (float) $shift->opening_cash;
        $expected = $opening + (float) $cashIn - (float) $cashOut;

        return number_format($expected, 2, '.', '');
    }
}
