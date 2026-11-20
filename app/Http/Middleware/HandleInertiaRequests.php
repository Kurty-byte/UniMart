<?php

namespace App\Http\Middleware;

use App\Enums\ItemCondition;
use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Message;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames(),
                ]) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'unreadNotificationsCount' => $user ? $user->unreadNotifications()->count() : 0,
            'unreadMessagesCount' => $user ? Message::where('receiver_id', $user->id)->whereNull('read_at')->count() : 0,
            'cartSummary' => function () use ($user): array {
                if (! $user) {
                    return ['itemsCount' => 0, 'expiresAt' => null];
                }

                $cart = Order::query()
                    ->where('buyer_id', $user->id)
                    ->where('status', OrderStatus::Cart)
                    ->withSum('orderItems', 'quantity')
                    ->first();

                return [
                    'itemsCount' => (int) ($cart?->order_items_sum_quantity ?? 0),
                    'expiresAt' => $cart?->expires_at?->toISOString(),
                ];
            },
            'hasOpenShift' => fn (): bool => $user && ($user->hasRole('staff') || $user->hasRole('admin'))
                ? $user->hasOpenShift()
                : false,
            'listingCategories' => fn () => $user ? Category::query()
                ->whereNull('parent_id')
                ->with(['children' => fn ($query) => $query->select(['id', 'name', 'parent_id'])->orderBy('name')])
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'children' => $category->children->map(fn (Category $child) => [
                        'id' => $child->id,
                        'name' => $child->name,
                    ])->all(),
                ])
                ->all() : [],
            'listingConditions' => fn () => array_map(
                fn (ItemCondition $condition) => [
                    'value' => $condition->value,
                    'label' => match ($condition) {
                        ItemCondition::New => 'Brand New',
                        ItemCondition::LikeNew => 'Like New',
                        ItemCondition::Used => 'Used',
                    },
                ],
                ItemCondition::cases()
            ),
        ];
    }
}
