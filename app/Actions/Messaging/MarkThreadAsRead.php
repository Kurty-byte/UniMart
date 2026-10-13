<?php

namespace App\Actions\Messaging;

use App\Models\Item;
use App\Models\Message;
use App\Models\User;

class MarkThreadAsRead
{
    /**
     * Mark all unread incoming messages in an item thread as read.
     */
    public function handle(User $reader, Item $item, User $counterpart): int
    {
        return Message::query()
            ->where('item_id', $item->id)
            ->where('sender_id', $counterpart->id)
            ->where('receiver_id', $reader->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
