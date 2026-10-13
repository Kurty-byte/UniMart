<?php

namespace App\Notifications;

use App\Enums\PayoutHoldReason;
use App\Models\OrderItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CashPayoutReadyNotification extends Notification
{
    use Queueable;

    public function __construct(
        public OrderItem $orderItem
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $title = $this->orderItem->item?->title ?? 'item';
        $amount = $this->orderItem->totalAmount();

        $message = match ($this->orderItem->payout_hold_reason) {
            PayoutHoldReason::FixedAmountQr => "Your payout of ₱{$amount} for \"{$title}\" is held in cash at the Hub desk. Reason: Your uploaded e-wallet QR code has a locked/fixed amount. Please claim cash at the Hub desk and update your QR in Payout Settings.",
            PayoutHoldReason::UnreadableQr => "Your payout of ₱{$amount} for \"{$title}\" is held in cash at the Hub desk. Reason: Your e-wallet QR code could not be scanned. Please claim cash at the Hub desk and verify your QR image.",
            PayoutHoldReason::InsufficientDigitalFunds => "Your payout of ₱{$amount} for \"{$title}\" is held in cash at the Hub desk due to desk digital balance limits. Please pick up your cash at the desk.",
            default => "Your cash payout of ₱{$amount} for \"{$title}\" is ready for pickup at the campus Hub desk.",
        };

        return [
            'order_item_id' => $this->orderItem->id,
            'amount' => $amount,
            'hold_reason' => $this->orderItem->payout_hold_reason?->value,
            'note' => $this->orderItem->payout_note,
            'message' => $message,
        ];
    }
}
