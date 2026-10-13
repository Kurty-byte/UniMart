<?php

namespace App\Http\Controllers\Staff;

use App\Actions\Payouts\DisburseDigitalPayout;
use App\Actions\Payouts\HoldCashPayout;
use App\Actions\Payouts\ReleaseCashPayout;
use App\Enums\PayoutStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\HoldCashPayoutRequest;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    /**
     * Display pending, held, and recently disbursed payouts for staff desk.
     */
    public function index(Request $request): Response
    {
        $pendingPayouts = OrderItem::query()
            ->where('payout_status', PayoutStatus::Pending)
            ->with(['item.seller:id,name,email,ewallet_qr_code,ewallet_provider,ewallet_account_name,ewallet_account_number', 'order:id,buyer_id,completed_at'])
            ->latest('id')
            ->get()
            ->map(fn (OrderItem $oi) => [
                'id' => $oi->id,
                'quantity' => $oi->quantity,
                'price' => $oi->price,
                'total_amount' => $oi->totalAmount(),
                'item' => $oi->item ? [
                    'id' => $oi->item->id,
                    'title' => $oi->item->title,
                    'shelf_location' => $oi->item->shelf_location,
                ] : null,
                'seller' => $oi->item?->seller ? [
                    'id' => $oi->item->seller->id,
                    'name' => $oi->item->seller->name,
                    'email' => $oi->item->seller->email,
                    'ewallet_provider' => $oi->item->seller->ewallet_provider,
                    'ewallet_account_name' => $oi->item->seller->ewallet_account_name,
                    'ewallet_account_number' => $oi->item->seller->ewallet_account_number,
                    'has_ewallet_qr' => $oi->item->seller->ewallet_qr_code !== null,
                    'ewallet_qr_url' => $oi->item->seller->ewallet_qr_code !== null
                        ? route('users.ewallet-qr.show', $oi->item->seller)
                        : null,
                ] : null,
                'order' => $oi->order ? [
                    'id' => $oi->order->id,
                    'completed_at' => $oi->order->completed_at?->toISOString(),
                ] : null,
            ]);

        $heldCashPayouts = OrderItem::query()
            ->where('payout_status', PayoutStatus::CashHeld)
            ->with(['item.seller:id,name,email', 'order:id,buyer_id,completed_at'])
            ->latest('id')
            ->get()
            ->map(fn (OrderItem $oi) => [
                'id' => $oi->id,
                'quantity' => $oi->quantity,
                'price' => $oi->price,
                'total_amount' => $oi->totalAmount(),
                'payout_hold_reason' => $oi->payout_hold_reason?->value,
                'payout_hold_reason_label' => $oi->payout_hold_reason?->label(),
                'payout_note' => $oi->payout_note,
                'item' => $oi->item ? [
                    'id' => $oi->item->id,
                    'title' => $oi->item->title,
                    'shelf_location' => $oi->item->shelf_location,
                ] : null,
                'seller' => $oi->item?->seller ? [
                    'id' => $oi->item->seller->id,
                    'name' => $oi->item->seller->name,
                    'email' => $oi->item->seller->email,
                ] : null,
            ]);

        $recentDisbursements = OrderItem::query()
            ->whereIn('payout_status', [PayoutStatus::PaidDigitally, PayoutStatus::CashClaimed])
            ->with(['item.seller:id,name,email', 'paidBy:id,name'])
            ->latest('paid_at')
            ->limit(15)
            ->get()
            ->map(fn (OrderItem $oi) => [
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
                'seller' => $oi->item?->seller ? [
                    'id' => $oi->item->seller->id,
                    'name' => $oi->item->seller->name,
                ] : null,
            ]);

        return Inertia::render('staff/payouts', [
            'pendingPayouts' => $pendingPayouts,
            'heldCashPayouts' => $heldCashPayouts,
            'recentDisbursements' => $recentDisbursements,
        ]);
    }

    /**
     * Disburse payout digitally via seller e-wallet QR.
     */
    public function digital(Request $request, OrderItem $orderItem, DisburseDigitalPayout $action): RedirectResponse
    {
        Gate::authorize('processPayout', $orderItem);

        /** @var User $staff */
        $staff = $request->user();

        $action->handle($staff, $orderItem);

        return redirect()->back();
    }

    /**
     * Hold payout for physical cash pickup.
     */
    public function hold(HoldCashPayoutRequest $request, OrderItem $orderItem, HoldCashPayout $action): RedirectResponse
    {
        /** @var User $staff */
        $staff = $request->user();

        $action->handle(
            $staff,
            $orderItem,
            $request->input('reason'),
            $request->input('note')
        );

        return redirect()->back();
    }

    /**
     * Release cash payout to seller at the Hub desk.
     */
    public function release(Request $request, OrderItem $orderItem, ReleaseCashPayout $action): RedirectResponse
    {
        Gate::authorize('releasePayout', $orderItem);

        /** @var User $staff */
        $staff = $request->user();

        $action->handle($staff, $orderItem);

        return redirect()->back();
    }
}
