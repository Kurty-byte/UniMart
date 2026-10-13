<?php

use App\Actions\Cart\AddToCart;
use App\Actions\Listings\CreateListing;
use App\Actions\Orders\CommitToBuy;
use App\Actions\Payouts\DisburseDigitalPayout;
use App\Actions\Shifts\CloseShift;
use App\Actions\Shifts\OpenShift;
use App\Actions\Staff\ApproveItemDropoff;
use App\Actions\Staff\CompleteOrderHandover;
use App\Actions\Staff\ResolveQrCode;
use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Activity;

test('complete physical and digital lifecycle from listing to shift audit', function () {
    $this->freezeTime();
    Storage::fake('public');
    Storage::fake('local');

    // 1. Setup actors
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();
    $seller = User::factory()->student()->create(['ewallet_qr_code' => 'ewallet/qr.png']);
    $buyer = User::factory()->student()->create();

    // 2. Seller lists item
    $category = Category::factory()->create(['name' => 'Uniforms']);
    $item = app(CreateListing::class)->handle($seller, [
        'category_id' => $category->id,
        'title' => 'College Uniform (Large)',
        'description' => 'Mint condition',
        'condition' => 'like_new',
        'price' => '250.00',
        'quantity' => 1,
    ], [UploadedFile::fake()->image('uniform.jpg')]);

    expect($item->status)->toBe(ItemStatus::PendingDropoff);

    // 3. Staff opens shift
    $shift = app(OpenShift::class)->handle($staff, '1000.00');

    // 4. Staff scans drop-off and approves item
    $scanResult = app(ResolveQrCode::class)->handle($item->dropoff_qr_code);
    expect($scanResult['type'])->toBe('dropoff');

    app(ApproveItemDropoff::class)->handle($staff, $item, 'Shelf-U01');
    expect($item->fresh()->status)->toBe(ItemStatus::Available);

    // 5. Buyer browses catalog and adds to cart (Soft Hold)
    $orderItem = app(AddToCart::class)->handle($buyer, $item->fresh(), 1);
    expect($item->fresh()->quantity)->toBe(0);

    // 6. Buyer commits to buy (Hard Hold)
    $order = app(CommitToBuy::class)->handle($buyer, $orderItem->order);
    expect($order->status)->toBe(OrderStatus::PendingHandover)
        ->and($order->claim_qr_code)->not->toBeNull();

    // 7. Buyer arrives at Hub; Staff scans Claim QR and completes handover
    $claimScan = app(ResolveQrCode::class)->handle($order->claim_qr_code);
    expect($claimScan['type'])->toBe('claim');

    app(CompleteOrderHandover::class)->handle($staff, $order);
    expect($order->fresh()->status)->toBe(OrderStatus::Completed)
        ->and($item->fresh()->status)->toBe(ItemStatus::Sold);

    // 8. Staff disburses digital payout
    $completedOrderItem = $order->fresh()->orderItems->first();
    app(DisburseDigitalPayout::class)->handle($staff, $completedOrderItem);
    expect($completedOrderItem->fresh()->payout_status)->toBe(PayoutStatus::PaidDigitally);

    // 9. Staff closes shift; cash collected = 250, cash out = 0 -> Expected = 1250.00
    $closedShift = app(CloseShift::class)->handle($shift, '1250.00');
    expect($closedShift->expected_cash)->toBe('1250.00')
        ->and($closedShift->actual_cash)->toBe('1250.00');

    // 10. Verify audit log integrity
    expect(Activity::inLog('hub')->count())->toBeGreaterThanOrEqual(4);
});
