<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories with item counts and hierarchy.
     */
    public function index(): Response
    {
        $categories = Category::query()
            ->roots()
            ->withCount('items')
            ->with(['children' => fn ($query) => $query->withCount('items')->orderBy('name')])
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'items_count' => $category->items_count,
                'children' => $category->children->map(fn (Category $child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'items_count' => $child->items_count,
                ])->all(),
            ]);

        return Inertia::render('admin/categories', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        return redirect()->route('admin.categories');
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return redirect()->route('admin.categories');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->children()->exists()) {
            throw ValidationException::withMessages([
                'category' => ['Remove or move its items and sub-categories first.'],
            ]);
        }

        if ($category->items()->withTrashed()->exists()) {
            throw ValidationException::withMessages([
                'category' => ['Remove or move its items and sub-categories first.'],
            ]);
        }

        $category->delete();

        return redirect()->route('admin.categories');
    }
}
