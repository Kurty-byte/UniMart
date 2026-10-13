<?php

use App\Actions\Messaging\SendMessage;
use App\Models\Item;
use App\Models\Message;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('lists student conversations grouped by item and counterpart', function () {
    $buyer = User::factory()->student()->create();
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create(['title' => 'Lab Coat']);

    app(SendMessage::class)->handle($buyer, $item, $seller, 'Can I get this?');

    $this->actingAs($seller)->get(route('student.messages'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/messages')
            ->has('threads', 1)
            ->where('threads.0.item.title', 'Lab Coat')
            ->where('threads.0.counterpart.id', $buyer->id));
});

it('sends a reply to an active message thread', function () {
    $buyer = User::factory()->student()->create();
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();

    $this->actingAs($seller)->post(route('student.messages.store'), [
        'item_id' => $item->id,
        'recipient_id' => $buyer->id,
        'content' => 'Yes, it is available at the hub.',
    ])->assertRedirect();

    expect(Message::where('sender_id', $seller->id)->where('content', 'Yes, it is available at the hub.')->exists())->toBeTrue();
});

it('marks messages as read via read endpoint', function () {
    $buyer = User::factory()->student()->create();
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();

    app(SendMessage::class)->handle($buyer, $item, $seller, 'Hello');

    $this->actingAs($seller)->post(route('student.messages.read', [$item, $buyer]))
        ->assertRedirect();

    expect(Message::where('receiver_id', $seller->id)->whereNull('read_at')->count())->toBe(0);
});
