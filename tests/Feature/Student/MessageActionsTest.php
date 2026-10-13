<?php

use App\Actions\Messaging\MarkThreadAsRead;
use App\Actions\Messaging\SendMessage;
use App\Models\Item;
use App\Models\Message;
use App\Models\User;
use Illuminate\Validation\ValidationException;

it('sends an item inquiry message from buyer to seller', function () {
    $buyer = User::factory()->student()->create();
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();

    $message = app(SendMessage::class)->handle($buyer, $item, $seller, 'Is the uniform still in good condition?');

    expect($message->sender_id)->toBe($buyer->id)
        ->and($message->receiver_id)->toBe($seller->id)
        ->and($message->item_id)->toBe($item->id)
        ->and($message->content)->toBe('Is the uniform still in good condition?')
        ->and($message->read_at)->toBeNull();
});

it('prevents a seller from messaging themselves about their own item', function () {
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();

    expect(fn () => app(SendMessage::class)->handle($seller, $item, $seller, 'Hello self'))
        ->toThrow(ValidationException::class);
});

it('prevents message if sender or recipient is suspended', function () {
    $buyer = User::factory()->student()->create();
    $seller = User::factory()->student()->create(['suspended_at' => now()]);
    $item = Item::factory()->for($seller, 'seller')->create();

    expect(fn () => app(SendMessage::class)->handle($buyer, $item, $seller, 'Hello'))
        ->toThrow(ValidationException::class);
});

it('prevents messaging if neither user is the item seller', function () {
    $buyer1 = User::factory()->student()->create();
    $buyer2 = User::factory()->student()->create();
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();

    expect(fn () => app(SendMessage::class)->handle($buyer1, $item, $buyer2, 'Hello'))
        ->toThrow(ValidationException::class);
});

it('marks all incoming messages in a thread as read', function () {
    $buyer = User::factory()->student()->create();
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();

    app(SendMessage::class)->handle($buyer, $item, $seller, 'Message 1');
    app(SendMessage::class)->handle($buyer, $item, $seller, 'Message 2');

    $markedCount = app(MarkThreadAsRead::class)->handle($seller, $item, $buyer);

    expect($markedCount)->toBe(2)
        ->and(Message::where('receiver_id', $seller->id)->whereNull('read_at')->count())->toBe(0);
});
