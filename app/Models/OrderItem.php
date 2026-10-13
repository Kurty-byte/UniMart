<?php

namespace App\Models;

use App\Enums\PayoutHoldReason;
use App\Enums\PayoutStatus;
use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $order_id
 * @property int $item_id
 * @property int $quantity
 * @property numeric-string $price
 * @property PayoutStatus $payout_status
 * @property PayoutHoldReason|null $payout_hold_reason
 * @property string|null $payout_note
 * @property int|null $paid_by
 * @property Carbon|null $paid_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'order_id',
    'item_id',
    'quantity',
    'price',
    'payout_status',
    'payout_hold_reason',
    'payout_note',
    'paid_by',
    'paid_at',
])]
class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory, LogsActivity;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price' => 'decimal:2',
            'payout_status' => PayoutStatus::class,
            'payout_hold_reason' => PayoutHoldReason::class,
            'paid_at' => 'datetime',
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
     * Get the order that this item belongs to.
     *
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /**
     * Get the item linked to this order item.
     *
     * @return BelongsTo<Item, $this>
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    /**
     * Get the staff member who disbursed the payout.
     *
     * @return BelongsTo<User, $this>
     */
    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    /**
     * Get the seller of the underlying item.
     */
    public function seller(): ?User
    {
        return $this->item?->seller;
    }

    /**
     * Get the calculated total amount for this order item.
     */
    public function totalAmount(): string
    {
        return number_format((float) $this->price * (int) $this->quantity, 2, '.', '');
    }
}
