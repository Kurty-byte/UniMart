<?php

namespace App\Http\Controllers\Student;

use App\Enums\ItemCondition;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\CatalogFilterRequest;
use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    /**
     * Display the searchable and filterable student catalog.
     */
    public function index(CatalogFilterRequest $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validated();

        $query = Item::query()
            ->inCatalog()
            ->with('category:id,name');

        // Filter by category and its sub-categories
        if (! empty($validated['category'])) {
            $cat = Category::find($validated['category']);
            if ($cat) {
                $categoryIds = $cat->selfAndChildIds();
                $query->whereIn('category_id', $categoryIds);
            }
        }

        // Search in title or description
        if (! empty($validated['search'])) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $validated['search']).'%';
            $query->where(function (Builder $q) use ($term) {
                $q->where('title', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        // Filter by condition
        if (! empty($validated['condition'])) {
            $query->where('condition', $validated['condition']);
        }

        // Filter by price range
        if (isset($validated['min_price'])) {
            $query->where('price', '>=', $validated['min_price']);
        }
        if (isset($validated['max_price'])) {
            $query->where('price', '<=', $validated['max_price']);
        }

        // Sorting
        $sort = $validated['sort'] ?? 'newest';
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc')->orderBy('id', 'desc'),
            'price_desc' => $query->orderBy('price', 'desc')->orderBy('id', 'desc'),
            default => $query->latest('id'),
        };

        $items = $query->paginate(24)
            ->withQueryString()
            ->through(function (Item $item) use ($user) {
                $firstImage = $item->images[0] ?? null;
                $imageUrl = $firstImage ? Storage::disk('public')->url($firstImage) : null;

                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'price' => $item->price,
                    'condition' => $item->condition->value,
                    'quantity' => $item->quantity,
                    'image_url' => $imageUrl,
                    'category' => $item->category ? [
                        'id' => $item->category->id,
                        'name' => $item->category->name,
                    ] : null,
                    'is_own' => $item->seller_id === $user->id,
                ];
            });

        $conditions = array_map(
            fn (ItemCondition $c) => [
                'value' => $c->value,
                'label' => match ($c) {
                    ItemCondition::New => 'Brand New',
                    ItemCondition::LikeNew => 'Like New',
                    ItemCondition::Used => 'Used',
                },
            ],
            ItemCondition::cases()
        );

        return Inertia::render('student/browse', [
            'items' => $items,
            'categories' => Category::tree(),
            'conditions' => $conditions,
            'filters' => [
                'search' => $validated['search'] ?? null,
                'category' => $validated['category'] ?? null,
                'condition' => $validated['condition'] ?? null,
                'min_price' => $validated['min_price'] ?? null,
                'max_price' => $validated['max_price'] ?? null,
                'sort' => $sort,
            ],
        ]);
    }
}
