<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\SettingKey;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $buyer_id
 * @property int|null $handled_by
 * @property numeric-string $total_price
 * @property OrderStatus $status
 * @property string|null $claim_qr_code
 * @property Carbon|null $expires_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'buyer_id',
    'handled_by',
    'total_price',
    'status',
    'claim_qr_code',
    'expires_at',
    'completed_at',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory, LogsActivity;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'total_price' => 'decimal:2',
            'expires_at' => 'datetime',
            'completed_at' => 'datetime',
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
     * Get the buyer of the order.
     *
     * @return BelongsTo<User, $this>
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the staff member who handled physical handover and payment.
     *
     * @return BelongsTo<User, $this>
     */
    public function handledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    /**
     * Get the order items for this order.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /**
     * Get the items in this order.
     *
     * @return BelongsToMany<Item, $this>
     */
    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'order_items')
            ->withPivot(['quantity', 'price', 'payout_status', 'paid_by', 'paid_at'])
            ->withTimestamps();
    }

    /**
     * Find or create the active cart order for the given buyer.
     */
    public static function findOrCreateCart(User $buyer): self
    {
        $minutes = Setting::integer(SettingKey::CartSoftHoldMinutes, 15);

        return static::firstOrCreate(
            [
                'buyer_id' => $buyer->id,
                'status' => OrderStatus::Cart,
            ],
            [
                'total_price' => '0.00',
                'expires_at' => now()->addMinutes($minutes),
            ]
        );
    }

    /**
     * Recalculate and update the order total price from its order items.
     */
    public function recalculateTotal(): void
    {
        $total = $this->orderItems()
            ->selectRaw('COALESCE(SUM(quantity * price), 0) as total')
            ->value('total') ?? '0.00';

        $this->update(['total_price' => (string) number_format((float) $total, 2, '.', '')]);
    }
}
