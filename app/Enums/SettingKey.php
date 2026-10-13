<?php

namespace App\Enums;

enum SettingKey: string
{
    case CartSoftHoldMinutes = 'cart_soft_hold_minutes';
    case OrderHardHoldHours = 'order_hard_hold_hours';
    case ItemShelfExpiryDays = 'item_shelf_expiry_days';

    /**
     * Get the default integer value for this setting.
     */
    public function default(): int
    {
        return match ($this) {
            self::CartSoftHoldMinutes => 15,
            self::OrderHardHoldHours => 24,
            self::ItemShelfExpiryDays => 30,
        };
    }

    /**
     * Get the validation rules for updating this setting.
     *
     * @return array<int, string>
     */
    public function rules(): array
    {
        return match ($this) {
            self::CartSoftHoldMinutes => ['required', 'integer', 'min:5', 'max:120'],
            self::OrderHardHoldHours => ['required', 'integer', 'min:1', 'max:168'],
            self::ItemShelfExpiryDays => ['required', 'integer', 'min:7', 'max:365'],
        };
    }

    /**
     * Get the human-readable label for this setting.
     */
    public function label(): string
    {
        return match ($this) {
            self::CartSoftHoldMinutes => 'Cart Soft Hold Duration (Minutes)',
            self::OrderHardHoldHours => 'Order Hard Hold Duration (Hours)',
            self::ItemShelfExpiryDays => 'Item Shelf Expiration (Days)',
        };
    }
}
