<?php

namespace App\Http\Middleware;

use App\Actions\Cart\RefreshCartHold;
use App\Enums\OrderStatus;
use App\Models\Order;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RefreshCartSoftHold
{
    public function __construct(
        protected RefreshCartHold $refreshCartHold
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $cart = Order::query()
                ->where('buyer_id', $user->id)
                ->where('status', OrderStatus::Cart)
                ->first();

            if ($cart) {
                $this->refreshCartHold->handle($cart);
            }
        }

        return $next($request);
    }
}
