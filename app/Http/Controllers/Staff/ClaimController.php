<?php

namespace App\Http\Controllers\Staff;

use App\Actions\Staff\CompleteOrderHandover;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClaimController extends Controller
{
    /**
     * Display a list of orders pending handover claim.
     */
    public function index(Request $request): Response
    {
        $pendingClaims = Order::query()
            ->where('status', OrderStatus::PendingHandover)
            ->with([
                'buyer:id,name,email',
                'orderItems.item:id,title,shelf_location,dropoff_qr_code',
            ])
            ->latest('id')
            ->paginate(15)
            ->through(fn (Order $order) => [
                'id' => $order->id,
                'claim_qr_code' => $order->claim_qr_code,
                'total_price' => $order->total_price,
                'expires_at' => $order->expires_at?->toISOString(),
                'buyer' => [
                    'id' => $order->buyer->id,
                    'name' => $order->buyer->name,
                    'email' => $order->buyer->email,
                ],
                'items' => $order->orderItems->map(fn (OrderItem $item) => [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'item' => $item->item ? [
                        'id' => $item->item->id,
                        'title' => $item->item->title,
                        'shelf_location' => $item->item->shelf_location,
                        'dropoff_qr_code' => $item->item->dropoff_qr_code,
                    ] : null,
                ]),
                'created_at' => $order->created_at?->toISOString(),
            ]);

        return Inertia::render('staff/claims', [
            'pendingClaims' => $pendingClaims,
        ]);
    }

    /**
     * Complete physical order handover and cash intake.
     */
    public function complete(Request $request, Order $order, CompleteOrderHandover $action): RedirectResponse
    {
        Gate::authorize('completeClaim', $order);

        /** @var User $staff */
        $staff = $request->user();

        $action->handle($staff, $order);

        return redirect()->back();
    }
}
