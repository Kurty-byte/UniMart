<?php

namespace App\Models;

use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * @property int $id
 * @property string $name
 * @property int|null $parent_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'parent_id'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    /**
     * Get the parent category.
     *
     * @return BelongsTo<Category, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Get the child categories.
     *
     * @return HasMany<Category, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * Get the items in this category.
     *
     * @return HasMany<Item, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'category_id');
    }

    /**
     * Determine if this category is a root (top-level) category.
     */
    public function isRoot(): bool
    {
        return $this->parent_id === null;
    }

    /**
     * Scope query to root categories.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeRoots(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Return this category id along with all direct children ids.
     *
     * @return array<int>
     */
    public function selfAndChildIds(): array
    {
        $childIds = $this->relationLoaded('children')
            ? $this->children->pluck('id')->all()
            : $this->children()->pluck('id')->all();

        return array_values(array_unique([$this->id, ...$childIds]));
    }

    /**
     * Build and return a sorted two-level category tree collection.
     *
     * @return Collection<int, array{id: int, name: string, children: array<int, array{id: int, name: string}>}>
     */
    public static function tree(): Collection
    {
        return static::query()
            ->roots()
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
    }
}
