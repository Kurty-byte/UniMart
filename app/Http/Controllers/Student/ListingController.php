<?php

namespace App\Http\Controllers\Student;

use App\Actions\Listings\CreateListing;
use App\Actions\Listings\DeleteListing;
use App\Actions\Listings\UpdateListing;
use App\Enums\ItemCondition;
use App\Enums\ItemStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreListingRequest;
use App\Http\Requests\Student\UpdateListingRequest;
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
     * Display a listing of the authenticated student's items.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $statusFilter = $request->query('status');
        $validStatus = is_string($statusFilter) ? ItemStatus::tryFrom($statusFilter) : null;

        $listings = Item::query()
            ->ownedBy($user)
            ->with('category:id,name')
            ->when($validStatus !== null, fn ($query) => $query->where('status', $validStatus))
            ->latest('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Item $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'condition' => $item->condition->value,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'status' => $item->status->value,
                'image_urls' => $item->image_urls,
                'category' => $item->category ? [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ] : null,
                'dropoff_qr_code' => in_array($item->status, [ItemStatus::PendingDropoff, ItemStatus::Expired], true)
                    ? $item->dropoff_qr_code
                    : null,
                'shelf_location' => $item->shelf_location,
                'created_at' => $item->created_at?->toISOString(),
            ]);

        // Status counts for all items belonging to the seller
        $countsRaw = Item::query()
            ->ownedBy($user)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        $statusCounts = [];
        foreach (ItemStatus::cases() as $case) {
            $statusCounts[$case->value] = (int) ($countsRaw[$case->value] ?? 0);
        }

        return Inertia::render('student/listings/index', [
            'listings' => $listings,
            'statusCounts' => $statusCounts,
            'currentStatus' => $validStatus?->value,
        ]);
    }

    /**
     * Show the form for creating a new listing.
     */
    public function create(): Response
    {
        Gate::authorize('create', Item::class);

        return Inertia::render('student/listings/create', [
            'categories' => $this->categoryTree(),
            'conditions' => $this->conditionOptions(),
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

    /**
     * Show the form for editing the specified pending listing.
     */
    public function edit(Item $item): Response
    {
        Gate::authorize('update', $item);

        $item->loadMissing('category:id,name');

        return Inertia::render('student/listings/edit', [
            'item' => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'condition' => $item->condition->value,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'category_id' => $item->category_id,
                'image_urls' => $item->image_urls,
                'images' => $item->images ?? [],
            ],
            'categories' => $this->categoryTree(),
            'conditions' => $this->conditionOptions(),
        ]);
    }

    /**
     * Update the specified listing in storage.
     */
    public function update(UpdateListingRequest $request, Item $item, UpdateListing $action): RedirectResponse
    {
        Gate::authorize('update', $item);

        $action->handle(
            $item,
            $request->safe()->except(['images', 'remove_images']),
            $request->file('images', []),
            $request->input('remove_images', [])
        );

        return redirect()->route('student.listings.show', $item);
    }

    /**
     * Remove the specified listing from storage.
     */
    public function destroy(Item $item, DeleteListing $action): RedirectResponse
    {
        Gate::authorize('delete', $item);

        $action->handle($item);

        return redirect()->route('student.listings.index');
    }

    /**
     * Get the Category tree for listing dropdowns.
     *
     * @return array<int, array{id: int, name: string, children: array<int, array{id: int, name: string}>}>
     */
    private function categoryTree(): array
    {
        return Category::query()
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
            ->all();
    }

    /**
     * Get the condition select options.
     *
     * @return array<int, array{value: string, label: string}>
     */
    private function conditionOptions(): array
    {
        return array_map(
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
    }
}
