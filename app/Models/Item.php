<?php

namespace App\Models;

use App\Enums\ItemCondition;
use App\Enums\ItemStatus;
use Database\Factories\ItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $seller_id
 * @property int $category_id
 * @property string $title
 * @property string $description
 * @property ItemCondition $condition
 * @property array<string> $images
 * @property numeric-string $price
 * @property int $quantity
 * @property ItemStatus $status
 * @property string|null $rejection_reason
 * @property string|null $shelf_location
 * @property string $dropoff_qr_code
 * @property Carbon|null $dropped_off_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'seller_id',
    'category_id',
    'title',
    'description',
    'condition',
    'images',
    'price',
    'quantity',
    'status',
    'rejection_reason',
    'shelf_location',
    'dropoff_qr_code',
    'dropped_off_at',
])]
class Item extends Model
{
    /** @use HasFactory<ItemFactory> */
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'condition' => ItemCondition::class,
            'status' => ItemStatus::class,
            'images' => 'array',
            'price' => 'decimal:2',
            'quantity' => 'integer',
            'dropped_off_at' => 'datetime',
        ];
    }

    /**
     * Configure the activity logging options.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    /**
     * Get the seller of the item.
     *
     * @return BelongsTo<User, $this>
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the category the item belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Get the order items associated with this item.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'item_id');
    }

    /**
     * Get the orders containing this item.
     *
     * @return BelongsToMany<Order, $this>
     */
    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_items')
            ->withPivot(['quantity', 'price', 'payout_status', 'paid_by', 'paid_at'])
            ->withTimestamps();
    }

    /**
     * Get the messages referencing this item.
     *
     * @return HasMany<Message, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'item_id');
    }

    /**
     * Get reports made against this item.
     *
     * @return HasMany<Report, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'item_id');
    }
}
