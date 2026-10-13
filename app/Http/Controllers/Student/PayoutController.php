<?php

namespace App\Http\Controllers\Student;

use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    /**
     * Display the student's payout status overview and cash claim instructions.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $baseQuery = OrderItem::query()
            ->whereHas('item', fn ($q) => $q->where('seller_id', $user->id))
            ->whereDoesntHave('order', fn ($q) => $q->where('status', OrderStatus::Cart));

        $totalPaid = number_format(
            (float) (clone $baseQuery)->whereIn('payout_status', [PayoutStatus::PaidDigitally, PayoutStatus::CashClaimed])->sum(DB::raw('price * quantity')),
            2,
            '.',
            ''
        );

        $readyForPickup = number_format(
            (float) (clone $baseQuery)->where('payout_status', PayoutStatus::CashHeld)->sum(DB::raw('price * quantity')),
            2,
            '.',
            ''
        );

        $pendingProcessing = number_format(
            (float) (clone $baseQuery)->where('payout_status', PayoutStatus::Pending)->sum(DB::raw('price * quantity')),
            2,
            '.',
            ''
        );

        $payouts = (clone $baseQuery)
            ->with(['item:id,title,shelf_location', 'paidBy:id,name'])
            ->latest('id')
            ->paginate(15)
            ->through(fn (OrderItem $oi) => [
                'id' => $oi->id,
                'quantity' => $oi->quantity,
                'price' => $oi->price,
                'total_amount' => $oi->totalAmount(),
                'payout_status' => $oi->payout_status->value,
                'paid_at' => $oi->paid_at?->toISOString(),
                'paid_by' => $oi->paidBy ? [
                    'id' => $oi->paidBy->id,
                    'name' => $oi->paidBy->name,
                ] : null,
                'item' => $oi->item ? [
                    'id' => $oi->item->id,
                    'title' => $oi->item->title,
                ] : null,
                'created_at' => $oi->created_at?->toISOString(),
            ]);

        return Inertia::render('student/payouts', [
            'summary' => [
                'totalPaid' => $totalPaid,
                'readyForPickup' => $readyForPickup,
                'pendingProcessing' => $pendingProcessing,
            ],
            'payouts' => $payouts,
            'hasEwalletQr' => $user->ewallet_qr_code !== null,
        ]);
    }
}
