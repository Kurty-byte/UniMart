<?php

namespace App\Http\Controllers\Student;

use App\Actions\Orders\CancelOrderReservation;
use App\Actions\Orders\CommitToBuy;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OrderClaimController extends Controller
{
    /**
     * Display active and past order claims.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $formatOrder = function (Order $order) {
            return [
                'id' => $order->id,
                'status' => $order->status->value,
                'total_price' => $order->total_price,
                'claim_qr_code' => $order->claim_qr_code,
                'expires_at' => $order->expires_at?->toISOString(),
                'completed_at' => $order->completed_at?->toISOString(),
                'created_at' => $order->created_at?->toISOString(),
                'items' => $order->orderItems->map(function (OrderItem $orderItem) {
                    $item = $orderItem->item;
                    $firstImage = $item?->images[0] ?? null;
                    $imageUrl = $firstImage ? Storage::disk('public')->url($firstImage) : null;

                    return [
                        'id' => $orderItem->id,
                        'title' => $item?->title ?? 'Item',
                        'price' => $orderItem->price,
                        'quantity' => $orderItem->quantity,
                        'image_url' => $imageUrl,
                        'shelf_location' => $item?->shelf_location,
                    ];
                })->all(),
            ];
        };

        $activeClaims = Order::query()
            ->where('buyer_id', $user->id)
            ->where('status', OrderStatus::PendingHandover)
            ->with(['orderItems.item'])
            ->latest('id')
            ->get()
            ->map($formatOrder)
            ->all();

        $pastClaims = Order::query()
            ->where('buyer_id', $user->id)
            ->whereIn('status', [OrderStatus::Completed, OrderStatus::Cancelled, OrderStatus::Expired])
            ->with(['orderItems.item'])
            ->latest('id')
            ->get()
            ->map($formatOrder)
            ->all();

        return Inertia::render('student/claims', [
            'activeClaims' => $activeClaims,
            'pastClaims' => $pastClaims,
        ]);
    }

    /**
     * Commit to buy active cart items and initiate hard-hold with Claim QR.
     */
    public function checkout(Request $request, CommitToBuy $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $cart = Order::query()
            ->where('buyer_id', $user->id)
            ->where('status', OrderStatus::Cart)
            ->firstOrFail();

        $action->handle($user, $cart);

        return redirect()->route('student.claims');
    }

    /**
     * Cancel a pending handover claim reservation.
     */
    public function cancel(Request $request, Order $order, CancelOrderReservation $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($order->buyer_id !== $user->id) {
            abort(403);
        }

        $action->handle($user, $order);

        return redirect()->route('student.claims');
    }
}
