<?php

namespace App\Actions\Messaging;

use App\Models\Item;
use App\Models\Message;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class SendMessage
{
    /**
     * Send an item inquiry or reply message between prospective buyer and seller.
     */
    public function handle(User $sender, Item $item, User $recipient, string $content): Message
    {
        if ($sender->id === $recipient->id) {
            throw ValidationException::withMessages([
                'recipient' => ['You cannot send messages to yourself.'],
            ]);
        }

        if ($sender->isSuspended() || $recipient->isSuspended()) {
            throw ValidationException::withMessages([
                'recipient' => ['Cannot communicate with a suspended account.'],
            ]);
        }

        if ($item->seller_id !== $sender->id && $item->seller_id !== $recipient->id) {
            throw ValidationException::withMessages([
                'item' => ['Messaging must involve the item seller.'],
            ]);
        }

        $trimmedContent = trim($content);
        if ($trimmedContent === '') {
            throw ValidationException::withMessages([
                'content' => ['Message content cannot be empty.'],
            ]);
        }

        return Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $recipient->id,
            'item_id' => $item->id,
            'content' => $trimmedContent,
        ]);
    }
}
