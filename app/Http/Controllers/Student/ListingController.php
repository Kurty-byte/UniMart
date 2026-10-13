<?php

namespace App\Http\Controllers\Student;

use App\Actions\Listings\CreateListing;
use App\Enums\ItemCondition;
use App\Enums\ItemStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreListingRequest;
use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    /**
     * Show the form for creating a new listing.
     */
    public function create(): Response
    {
        Gate::authorize('create', Item::class);

        $categories = Category::query()
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
            ]);

        $conditions = array_map(
            fn (ItemCondition $condition) => [
                'value' => $condition->value,
                'label' => match ($condition) {
                    ItemCondition::New => 'Brand New',
                    ItemCondition::LikeNew => 'Like New',
                    ItemCondition::Used => 'Used',
                },
            ],
            ItemCondition::cases()
        );

        return Inertia::render('student/listings/create', [
            'categories' => $categories,
            'conditions' => $conditions,
        ]);
    }

    /**
     * Store a newly created listing in storage.
     */
    public function store(StoreListingRequest $request, CreateListing $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $item = $action->handle(
            $user,
            $request->safe()->except('images'),
            $request->file('images', [])
        );

        return redirect()->route('student.listings.show', $item);
    }

    /**
     * Display the specified listing.
     */
    public function show(Request $request, Item $item): Response
    {
        Gate::authorize('view', $item);

        $item->loadMissing('category:id,name');

        $canShowQr = in_array($item->status, [ItemStatus::PendingDropoff, ItemStatus::Expired], true);

        return Inertia::render('student/listings/show', [
            'item' => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'condition' => $item->condition->value,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'status' => $item->status->value,
                'image_urls' => $item->image_urls,
                'category' => $item->category ? [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ] : null,
                'dropoff_qr_code' => $canShowQr ? $item->dropoff_qr_code : null,
                'shelf_location' => $item->shelf_location,
                'rejection_reason' => $item->rejection_reason,
                'dropped_off_at' => $item->dropped_off_at?->toISOString(),
                'shelf_expires_at' => $item->shelfExpiresAt()?->toISOString(),
            ],
        ]);
    }
}
