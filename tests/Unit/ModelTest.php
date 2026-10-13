<?php

use App\Enums\ItemCondition;
use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Enums\ReportStatus;
use App\Models\Category;
use App\Models\DrawerCount;
use App\Models\Item;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Report;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tests\TestCase;

uses(TestCase::class);

test('enums have expected cases and values', function () {
    expect(ItemCondition::New->value)->toBe('new');
    expect(ItemCondition::LikeNew->value)->toBe('like_new');
    expect(ItemCondition::Used->value)->toBe('used');

    expect(ItemStatus::PendingDropoff->value)->toBe('pending_dropoff');
    expect(ItemStatus::Available->value)->toBe('available');
    expect(ItemStatus::Sold->value)->toBe('sold');
    expect(ItemStatus::Expired->value)->toBe('expired');
    expect(ItemStatus::Retrieved->value)->toBe('retrieved');
    expect(ItemStatus::Rejected->value)->toBe('rejected');

    expect(OrderStatus::Cart->value)->toBe('cart');
    expect(OrderStatus::PendingHandover->value)->toBe('pending_handover');
    expect(OrderStatus::Completed->value)->toBe('completed');
    expect(OrderStatus::Cancelled->value)->toBe('cancelled');
    expect(OrderStatus::Expired->value)->toBe('expired');

    expect(PayoutStatus::Pending->value)->toBe('pending');
    expect(PayoutStatus::PaidDigitally->value)->toBe('paid_digitally');
    expect(PayoutStatus::CashHeld->value)->toBe('cash_held');
    expect(PayoutStatus::CashClaimed->value)->toBe('cash_claimed');

    expect(ReportStatus::Pending->value)->toBe('pending');
    expect(ReportStatus::Resolved->value)->toBe('resolved');
    expect(ReportStatus::Dismissed->value)->toBe('dismissed');
});

test('user relationships and suspension helper work', function () {
    $user = new User;

    expect($user->items())->toBeInstanceOf(HasMany::class);
    expect($user->items()->getForeignKeyName())->toBe('seller_id');

    expect($user->orders())->toBeInstanceOf(HasMany::class);
    expect($user->orders()->getForeignKeyName())->toBe('buyer_id');

    expect($user->handledOrders())->toBeInstanceOf(HasMany::class);
    expect($user->handledOrders()->getForeignKeyName())->toBe('handled_by');

    expect($user->disbursedOrderItems())->toBeInstanceOf(HasMany::class);
    expect($user->disbursedOrderItems()->getForeignKeyName())->toBe('paid_by');

    expect($user->sentMessages())->toBeInstanceOf(HasMany::class);
    expect($user->sentMessages()->getForeignKeyName())->toBe('sender_id');

    expect($user->receivedMessages())->toBeInstanceOf(HasMany::class);
    expect($user->receivedMessages()->getForeignKeyName())->toBe('receiver_id');

    expect($user->drawerCounts())->toBeInstanceOf(HasMany::class);
    expect($user->drawerCounts()->getForeignKeyName())->toBe('staff_id');

    expect($user->filedReports())->toBeInstanceOf(HasMany::class);
    expect($user->filedReports()->getForeignKeyName())->toBe('reporter_id');

    expect($user->receivedReports())->toBeInstanceOf(HasMany::class);
    expect($user->receivedReports()->getForeignKeyName())->toBe('reported_user_id');

    expect($user->resolvedReports())->toBeInstanceOf(HasMany::class);
    expect($user->resolvedReports()->getForeignKeyName())->toBe('resolved_by');

    expect($user->isSuspended())->toBeFalse();
    $user->suspended_at = now();
    expect($user->isSuspended())->toBeTrue();
});

test('category relationships work', function () {
    $category = new Category;

    expect($category->parent())->toBeInstanceOf(BelongsTo::class);
    expect($category->parent()->getForeignKeyName())->toBe('parent_id');

    expect($category->children())->toBeInstanceOf(HasMany::class);
    expect($category->children()->getForeignKeyName())->toBe('parent_id');

    expect($category->items())->toBeInstanceOf(HasMany::class);
    expect($category->items()->getForeignKeyName())->toBe('category_id');
});

test('item casts and relationships work', function () {
    $item = new Item;

    expect($item->getCasts()['condition'])->toBe(ItemCondition::class);
    expect($item->getCasts()['status'])->toBe(ItemStatus::class);
    expect($item->getCasts()['images'])->toBe('array');
    expect($item->getCasts()['price'])->toBe('decimal:2');
    expect($item->getCasts()['quantity'])->toBe('integer');
    expect($item->getCasts()['dropped_off_at'])->toBe('datetime');

    expect($item->seller())->toBeInstanceOf(BelongsTo::class);
    expect($item->seller()->getForeignKeyName())->toBe('seller_id');

    expect($item->category())->toBeInstanceOf(BelongsTo::class);
    expect($item->category()->getForeignKeyName())->toBe('category_id');

    expect($item->orderItems())->toBeInstanceOf(HasMany::class);
    expect($item->orderItems()->getForeignKeyName())->toBe('item_id');

    expect($item->orders())->toBeInstanceOf(BelongsToMany::class);
    expect($item->orders()->getTable())->toBe('order_items');

    expect($item->messages())->toBeInstanceOf(HasMany::class);
    expect($item->messages()->getForeignKeyName())->toBe('item_id');

    expect($item->reports())->toBeInstanceOf(HasMany::class);
    expect($item->reports()->getForeignKeyName())->toBe('item_id');
});

test('order casts and relationships work', function () {
    $order = new Order;

    expect($order->getCasts()['status'])->toBe(OrderStatus::class);
    expect($order->getCasts()['total_price'])->toBe('decimal:2');
    expect($order->getCasts()['expires_at'])->toBe('datetime');
    expect($order->getCasts()['completed_at'])->toBe('datetime');

    expect($order->buyer())->toBeInstanceOf(BelongsTo::class);
    expect($order->buyer()->getForeignKeyName())->toBe('buyer_id');

    expect($order->handledBy())->toBeInstanceOf(BelongsTo::class);
    expect($order->handledBy()->getForeignKeyName())->toBe('handled_by');

    expect($order->orderItems())->toBeInstanceOf(HasMany::class);
    expect($order->orderItems()->getForeignKeyName())->toBe('order_id');

    expect($order->items())->toBeInstanceOf(BelongsToMany::class);
    expect($order->items()->getTable())->toBe('order_items');
});

test('order item casts and relationships work', function () {
    $orderItem = new OrderItem;

    expect($orderItem->getCasts()['payout_status'])->toBe(PayoutStatus::class);
    expect($orderItem->getCasts()['price'])->toBe('decimal:2');
    expect($orderItem->getCasts()['quantity'])->toBe('integer');
    expect($orderItem->getCasts()['paid_at'])->toBe('datetime');

    expect($orderItem->order())->toBeInstanceOf(BelongsTo::class);
    expect($orderItem->order()->getForeignKeyName())->toBe('order_id');

    expect($orderItem->item())->toBeInstanceOf(BelongsTo::class);
    expect($orderItem->item()->getForeignKeyName())->toBe('item_id');

    expect($orderItem->paidBy())->toBeInstanceOf(BelongsTo::class);
    expect($orderItem->paidBy()->getForeignKeyName())->toBe('paid_by');
});

test('message casts and relationships work', function () {
    $message = new Message;

    expect($message->getCasts()['read_at'])->toBe('datetime');

    expect($message->sender())->toBeInstanceOf(BelongsTo::class);
    expect($message->sender()->getForeignKeyName())->toBe('sender_id');

    expect($message->receiver())->toBeInstanceOf(BelongsTo::class);
    expect($message->receiver()->getForeignKeyName())->toBe('receiver_id');

    expect($message->item())->toBeInstanceOf(BelongsTo::class);
    expect($message->item()->getForeignKeyName())->toBe('item_id');

    expect($message->isRead())->toBeFalse();
    $message->read_at = now();
    expect($message->isRead())->toBeTrue();
});

test('drawer count casts and relationships work', function () {
    $drawerCount = new DrawerCount;

    expect($drawerCount->getCasts()['shift_started_at'])->toBe('datetime');
    expect($drawerCount->getCasts()['shift_ended_at'])->toBe('datetime');
    expect($drawerCount->getCasts()['expected_cash'])->toBe('decimal:2');
    expect($drawerCount->getCasts()['actual_cash'])->toBe('decimal:2');

    expect($drawerCount->staff())->toBeInstanceOf(BelongsTo::class);
    expect($drawerCount->staff()->getForeignKeyName())->toBe('staff_id');
});

test('report casts and relationships work', function () {
    $report = new Report;

    expect($report->getCasts()['status'])->toBe(ReportStatus::class);
    expect($report->getCasts()['resolved_at'])->toBe('datetime');

    expect($report->reporter())->toBeInstanceOf(BelongsTo::class);
    expect($report->reporter()->getForeignKeyName())->toBe('reporter_id');

    expect($report->reportedUser())->toBeInstanceOf(BelongsTo::class);
    expect($report->reportedUser()->getForeignKeyName())->toBe('reported_user_id');

    expect($report->item())->toBeInstanceOf(BelongsTo::class);
    expect($report->item()->getForeignKeyName())->toBe('item_id');

    expect($report->resolvedBy())->toBeInstanceOf(BelongsTo::class);
    expect($report->resolvedBy()->getForeignKeyName())->toBe('resolved_by');
});

test('setting model fillable attributes work', function () {
    $setting = new Setting(['key' => 'cart_soft_hold_minutes', 'value' => '15']);

    expect($setting->key)->toBe('cart_soft_hold_minutes');
    expect($setting->value)->toBe('15');
});
