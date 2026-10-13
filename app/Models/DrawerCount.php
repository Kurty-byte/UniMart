<?php

namespace App\Models;

use Database\Factories\DrawerCountFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $staff_id
 * @property Carbon $shift_started_at
 * @property Carbon $shift_ended_at
 * @property numeric-string $expected_cash
 * @property numeric-string $actual_cash
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'staff_id',
    'shift_started_at',
    'shift_ended_at',
    'expected_cash',
    'actual_cash',
    'notes',
])]
class DrawerCount extends Model
{
    /** @use HasFactory<DrawerCountFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'shift_started_at' => 'datetime',
            'shift_ended_at' => 'datetime',
            'expected_cash' => 'decimal:2',
            'actual_cash' => 'decimal:2',
        ];
    }

    /**
     * Get the staff member for this drawer count.
     *
     * @return BelongsTo<User, $this>
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
