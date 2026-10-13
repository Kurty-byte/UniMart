<?php

namespace App\Http\Controllers\Student;

use App\Actions\Cart\AddToCart;
use App\Actions\Cart\RemoveFromCart;
use App\Actions\Cart\UpdateCartItemQuantity;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\AddToCartRequest;
use App\Http\Requests\Student\UpdateCartItemRequest;
use App\Models\Item;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Display the student's active cart.
     */
    public function show(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $cart = Order::query()
            ->where('buyer_id', $user->id)
            ->where('status', OrderStatus::Cart)
            ->with(['orderItems.item.category:id,name'])
            ->first();

        $items = [];
        $totalPrice = '0.00';
        $expiresAt = null;

        if ($cart && $cart->orderItems->isNotEmpty()) {
            $totalPrice = $cart->total_price;
            $expiresAt = $cart->expires_at?->toISOString();

            $items = $cart->orderItems->map(function (OrderItem $orderItem) {
                $item = $orderItem->item;
                $firstImage = $item?->images[0] ?? null;
                $imageUrl = $firstImage ? Storage::disk('public')->url($firstImage) : null;

                return [
                    'id' => $orderItem->id,
                    'item_id' => $orderItem->item_id,
                    'title' => $item?->title ?? 'Unavailable Item',
                    'price' => $orderItem->price,
                    'quantity' => $orderItem->quantity,
                    'max_available' => ($item?->quantity ?? 0) + $orderItem->quantity,
                    'image_url' => $imageUrl,
                    'category' => $item?->category ? [
                        'id' => $item->category->id,
                        'name' => $item->category->name,
                    ] : null,
                ];
            })->all();
        }

        return Inertia::render('student/cart', [
            'cart' => [
                'items' => $items,
                'total_price' => $totalPrice,
                'expires_at' => $expiresAt,
                'hasItems' => ! empty($items),
            ],
        ]);
    }

    /**
     * Add an item to the active cart.
     */
    public function storeItem(AddToCartRequest $request, AddToCart $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Item $item */
        $item = Item::findOrFail($request->validated('item_id'));

        $action->handle($user, $item, (int) $request->validated('quantity'));

        return redirect()->back();
    }

    /**
     * Update an item quantity in the cart.
     */
    public function updateItem(UpdateCartItemRequest $request, OrderItem $orderItem, UpdateCartItemQuantity $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->handle($user, $orderItem, (int) $request->validated('quantity'));

        return redirect()->route('student.cart');
    }

    /**
     * Remove an item from the cart.
     */
    public function destroyItem(Request $request, OrderItem $orderItem, RemoveFromCart $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($orderItem->order?->buyer_id !== $user->id) {
            abort(403);
        }

        $action->handle($user, $orderItem);

        return redirect()->route('student.cart');
    }

    /**
     * Clear all items from the active cart.
     */
    public function clear(Request $request, RemoveFromCart $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $cart = Order::query()
            ->where('buyer_id', $user->id)
            ->where('status', OrderStatus::Cart)
            ->with('orderItems')
            ->first();

        if ($cart) {
            foreach ($cart->orderItems as $orderItem) {
                $action->handle($user, $orderItem);
            }
        }

        return redirect()->route('student.cart');
    }
}
