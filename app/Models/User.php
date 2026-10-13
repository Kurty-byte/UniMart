<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Activitylog\Models\Concerns\CausesActivity;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property string|null $ewallet_qr_code
 * @property Carbon|null $suspended_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'ewallet_qr_code', 'suspended_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use CausesActivity, HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'suspended_at' => 'datetime',
        ];
    }

    /**
     * Check if the user is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->suspended_at !== null;
    }

    /**
     * Check if the user has any marketplace transaction or operational history.
     */
    public function hasMarketplaceHistory(): bool
    {
        return $this->items()->withTrashed()->exists()
            || $this->orders()->exists()
            || $this->handledOrders()->exists()
            || $this->disbursedOrderItems()->exists()
            || $this->drawerCounts()->exists();
    }

    /**
     * Determine if the user has uploaded an e-wallet QR code.
     */
    public function hasEwalletQr(): bool
    {
        return $this->ewallet_qr_code !== null;
    }

    /**
     * Get the private streaming URL for the user's e-wallet QR code.
     */
    public function ewalletQrUrl(): ?string
    {
        return $this->hasEwalletQr() ? route('users.ewallet-qr.show', $this) : null;
    }

    /**
     * Get the items listed for sale by the user.
     *
     * @return HasMany<Item, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'seller_id');
    }

    /**
     * Get the orders placed by the user.
     *
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    /**
     * Get the orders handled by this staff member.
     *
     * @return HasMany<Order, $this>
     */
    public function handledOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'handled_by');
    }

    /**
     * Get the order items where payout was disbursed by this staff member.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function disbursedOrderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'paid_by');
    }

    /**
     * Get the messages sent by the user.
     *
     * @return HasMany<Message, $this>
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Get the messages received by the user.
     *
     * @return HasMany<Message, $this>
     */
    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    /**
     * Get the drawer counts recorded by this staff member.
     *
     * @return HasMany<DrawerCount, $this>
     */
    public function drawerCounts(): HasMany
    {
        return $this->hasMany(DrawerCount::class, 'staff_id');
    }

    /**
     * Get the reports filed by this user.
     *
     * @return HasMany<Report, $this>
     */
    public function filedReports(): HasMany
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    /**
     * Get the reports filed against this user.
     *
     * @return HasMany<Report, $this>
     */
    public function receivedReports(): HasMany
    {
        return $this->hasMany(Report::class, 'reported_user_id');
    }

    /**
     * Get the reports resolved by this staff member.
     *
     * @return HasMany<Report, $this>
     */
    public function resolvedReports(): HasMany
    {
        return $this->hasMany(Report::class, 'resolved_by');
    }

    /**
     * Get the currently active open shift for this staff member, if any.
     */
    public function activeShift(): ?DrawerCount
    {
        return $this->drawerCounts()->open()->first();
    }

    /**
     * Determine if this staff member currently has an active open shift.
     */
    public function hasOpenShift(): bool
    {
        return $this->drawerCounts()->open()->exists();
    }
}
