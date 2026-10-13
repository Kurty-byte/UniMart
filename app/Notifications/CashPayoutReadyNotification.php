<?php

namespace App\Notifications;

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

        return [
            'order_item_id' => $this->orderItem->id,
            'amount' => $this->orderItem->totalAmount(),
            'message' => "Your cash payout of ₱{$this->orderItem->totalAmount()} for \"{$title}\" is ready for pickup at the campus Hub desk.",
        ];
    }
}
