<?php

use App\Actions\Messaging\SendMessage;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\CashPayoutReadyNotification;
use Inertia\Testing\AssertableInertia as Assert;

it('shares unread notification and message counts in Inertia props', function () {
    $student = User::factory()->student()->create();
    $seller = User::factory()->student()->create();
    $item = Item::factory()->for($seller, 'seller')->create();
    $orderItem = OrderItem::factory()->for($item)->create();

    app(SendMessage::class)->handle($seller, $item, $student, 'Hello student');
    $student->notify(new CashPayoutReadyNotification($orderItem));

    $this->actingAs($student)->get(route('student.browse'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('unreadMessagesCount', 1)
            ->where('unreadNotificationsCount', 1));
});

it('lists notifications for the authenticated student', function () {
    $student = User::factory()->student()->create();
    $item = Item::factory()->create();
    $orderItem = OrderItem::factory()->for($item)->create();
    $student->notify(new CashPayoutReadyNotification($orderItem));

    $this->actingAs($student)->get(route('student.notifications'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/notifications')
            ->has('notifications.data', 1));
});

it('marks a notification as read', function () {
    $student = User::factory()->student()->create();
    $item = Item::factory()->create();
    $orderItem = OrderItem::factory()->for($item)->create();
    $student->notify(new CashPayoutReadyNotification($orderItem));
    $notification = $student->unreadNotifications()->first();

    $this->actingAs($student)
        ->post(route('student.notifications.read', $notification->id))
        ->assertRedirect();

    expect($student->fresh()->unreadNotifications()->count())->toBe(0);
});

it('marks all notifications as read', function () {
    $student = User::factory()->student()->create();
    $item = Item::factory()->create();
    $orderItem = OrderItem::factory()->for($item)->create();
    $student->notify(new CashPayoutReadyNotification($orderItem));
    $student->notify(new CashPayoutReadyNotification($orderItem));

    $this->actingAs($student)
        ->post(route('student.notifications.read-all'))
        ->assertRedirect();

    expect($student->fresh()->unreadNotifications()->count())->toBe(0);
});
