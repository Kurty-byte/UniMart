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

class SalesController extends Controller
{
    /**
     * Display the student's sold items and earnings ledger.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $soldItems = OrderItem::query()
            ->whereHas('item', fn ($q) => $q->where('seller_id', $user->id))
            ->whereDoesntHave('order', fn ($q) => $q->where('status', OrderStatus::Cart))
            ->with(['item:id,title,shelf_location', 'order.buyer:id,name'])
            ->latest('id')
            ->paginate(15)
            ->through(fn (OrderItem $oi) => [
                'id' => $oi->id,
                'quantity' => $oi->quantity,
                'price' => $oi->price,
                'total' => $oi->totalAmount(),
                'payout_status' => $oi->payout_status->value,
                'buyer_name' => $oi->order?->buyer?->name,
                'date' => $oi->created_at?->toISOString(),
                'item' => $oi->item ? [
                    'id' => $oi->item->id,
                    'title' => $oi->item->title,
                ] : null,
            ]);

        $totalEarned = number_format(
            (float) OrderItem::query()
                ->whereHas('item', fn ($q) => $q->where('seller_id', $user->id))
                ->whereIn('payout_status', [PayoutStatus::PaidDigitally, PayoutStatus::CashClaimed])
                ->sum(DB::raw('price * quantity')),
            2,
            '.',
            ''
        );

        return Inertia::render('student/sales', [
            'soldItems' => $soldItems,
            'totalEarned' => $totalEarned,
        ]);
    }
}
