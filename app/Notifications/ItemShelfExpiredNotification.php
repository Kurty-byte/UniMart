<?php

namespace App\Notifications;

use App\Models\Item;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ItemShelfExpiredNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Item $item
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
        return [
            'item_id' => $this->item->id,
            'title' => $this->item->title,
            'message' => 'Your item "'.$this->item->title.'" has reached the end of its campus shelf life and is ready for pickup at the Hub desk.',
        ];
    }
}
