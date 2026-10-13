<?php

use App\Actions\Cart\RefreshCartHold;
use App\Enums\OrderStatus;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ShiftAuditController;
use App\Http\Controllers\Admin\StaffManagementController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\EwalletQrController;
use App\Http\Controllers\Staff\ClaimController;
use App\Http\Controllers\Staff\DrawerCountController;
use App\Http\Controllers\Staff\DropoffController;
use App\Http\Controllers\Staff\PayoutController;
use App\Http\Controllers\Staff\ReturnController;
use App\Http\Controllers\Staff\ScanController;
use App\Http\Controllers\Student\CartController;
use App\Http\Controllers\Student\CatalogController;
use App\Http\Controllers\Student\ListingController;
use App\Http\Controllers\Student\MessageController;
use App\Http\Controllers\Student\NotificationController;
use App\Http\Controllers\Student\OrderClaimController;
use App\Http\Controllers\Student\PayoutController as StudentPayoutController;
use App\Http\Controllers\Student\ReportController as StudentReportController;
use App\Http\Controllers\Student\SalesController;
use App\Http\Middleware\RefreshCartSoftHold;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        if ($user->hasRole('admin')) {
            return inertia('dashboard');
        }

        if ($user->hasRole('staff')) {
            return redirect()->route('staff.scan');
        }

        return redirect()->route('student.browse');
    })->name('dashboard');

    // Staff Routes (Desk Operations - accessible by Staff and Admins)
    Route::middleware('role:staff|admin')->prefix('staff')->name('staff.')->group(function () {
        Route::get('scan', [ScanController::class, 'index'])->name('scan');
        Route::post('scan/resolve', [ScanController::class, 'resolve'])->middleware('throttle:qr-scan')->name('scan.resolve');
        Route::get('drop-offs', [DropoffController::class, 'index'])->name('drop-offs');
        Route::post('drop-offs/{item}/approve', [DropoffController::class, 'approve'])->name('drop-offs.approve');
        Route::post('drop-offs/{item}/reject', [DropoffController::class, 'reject'])->name('drop-offs.reject');
        Route::get('drop-offs/{item}/tag', [DropoffController::class, 'tag'])->name('drop-offs.tag');
        Route::get('claims', [ClaimController::class, 'index'])->name('claims');
        Route::get('returns', [ReturnController::class, 'index'])->name('returns');
        Route::post('returns/{item}/retrieve', [ReturnController::class, 'retrieve'])->name('returns.retrieve');
        Route::middleware('shift.open')->group(function () {
            Route::post('claims/{order}/complete', [ClaimController::class, 'complete'])->name('claims.complete');
            Route::get('payouts', [PayoutController::class, 'index'])->name('payouts');
            Route::post('payouts/{orderItem}/digital', [PayoutController::class, 'digital'])->name('payouts.digital');
            Route::post('payouts/{orderItem}/hold', [PayoutController::class, 'hold'])->name('payouts.hold');
            Route::post('payouts/{orderItem}/release', [PayoutController::class, 'release'])->name('payouts.release');
        });
        Route::get('drawer-count', [DrawerCountController::class, 'index'])->name('drawer-count');
        Route::post('shifts/open', [DrawerCountController::class, 'open'])->name('shifts.open');
        Route::post('shifts/close', [DrawerCountController::class, 'close'])->name('shifts.close');
    });

    // Admin Routes (Oversight & Management)
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('inventory', [InventoryController::class, 'index'])->name('inventory');
        Route::post('inventory/{item}/take-down', [InventoryController::class, 'takeDown'])->name('inventory.take-down');
        Route::get('categories', [CategoryController::class, 'index'])->name('categories');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::get('users', [UserController::class, 'index'])->name('users');
        Route::post('users/{user}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
        Route::post('users/{user}/unsuspend', [UserController::class, 'unsuspend'])->name('users.unsuspend');
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::post('reports/{report}/resolve', [ReportController::class, 'resolve'])->name('reports.resolve');
        Route::get('finances', [FinanceController::class, 'index'])->name('finances');
        Route::get('shift-audits', [ShiftAuditController::class, 'index'])->name('shift-audits');
        Route::get('settings', [SettingController::class, 'index'])->name('settings');
        Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
        Route::get('staff', [StaffManagementController::class, 'index'])->name('staff.index');
        Route::post('staff', [StaffManagementController::class, 'store'])->name('staff.store');
        Route::put('staff/{user}/permissions', [StaffManagementController::class, 'updatePermissions'])->name('staff.permissions.update');
        Route::delete('staff/{user}', [StaffManagementController::class, 'destroy'])->name('staff.revoke');
    });

    // Student Routes (Unified Seller and Buyer)
    Route::middleware(['role:student', RefreshCartSoftHold::class])->prefix('student')->name('student.')->group(function () {
        Route::get('browse', [CatalogController::class, 'index'])->name('browse');
        Route::get('items/{item}', [CatalogController::class, 'show'])->name('items.show');
        Route::get('cart', [CartController::class, 'show'])->name('cart');
        Route::post('cart/items', [CartController::class, 'storeItem'])->name('cart.items.store');
        Route::patch('cart/items/{orderItem}', [CartController::class, 'updateItem'])->name('cart.items.update');
        Route::delete('cart/items/{orderItem}', [CartController::class, 'destroyItem'])->name('cart.items.destroy');
        Route::delete('cart', [CartController::class, 'clear'])->name('cart.clear');
        Route::post('cart/checkout', [OrderClaimController::class, 'checkout'])->middleware('throttle:checkout')->name('cart.checkout');
        Route::post('cart/heartbeat', function (Request $request, RefreshCartHold $refreshCartHold) {
            $user = $request->user();
            $cart = Order::query()
                ->where('buyer_id', $user->id)
                ->where('status', OrderStatus::Cart)
                ->first();

            if (! $cart) {
                return response()->json(['status' => 'empty']);
            }

            $active = $refreshCartHold->handle($cart);

            return response()->json([
                'status' => $active ? 'active' : 'expired',
                'expires_at' => $cart->fresh()->expires_at?->toISOString(),
            ]);
        })->middleware('throttle:cart-heartbeat')->name('cart.heartbeat');
        Route::inertia('saved', 'student/saved')->name('saved');

        Route::get('listings', [ListingController::class, 'index'])->name('listings.index');
        Route::get('listings/create', [ListingController::class, 'create'])->name('listings.create');
        Route::post('listings', [ListingController::class, 'store'])->middleware('throttle:uploads')->name('listings.store');
        Route::get('listings/{item}', [ListingController::class, 'show'])->name('listings.show');
        Route::get('listings/{item}/edit', [ListingController::class, 'edit'])->name('listings.edit');
        Route::put('listings/{item}', [ListingController::class, 'update'])->name('listings.update');
        Route::delete('listings/{item}', [ListingController::class, 'destroy'])->name('listings.destroy');

        Route::get('claims', [OrderClaimController::class, 'index'])->name('claims');
        Route::delete('claims/{order}', [OrderClaimController::class, 'cancel'])->name('claims.cancel');
        Route::get('sales', [SalesController::class, 'index'])->name('sales');
        Route::inertia('returns', 'student/returns')->name('returns');
        Route::get('payouts', [StudentPayoutController::class, 'index'])->name('payouts');

        Route::get('messages', [MessageController::class, 'index'])->name('messages');
        Route::post('messages', [MessageController::class, 'store'])->middleware('throttle:messaging')->name('messages.store');
        Route::post('messages/{item}/{user}/read', [MessageController::class, 'read'])->name('messages.read');
        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications');
        Route::post('notifications/{id}/read', [NotificationController::class, 'read'])->name('notifications.read');
        Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
        Route::get('reports', [StudentReportController::class, 'index'])->name('reports.index');
        Route::post('reports', [StudentReportController::class, 'store'])->middleware('throttle:5,1')->name('reports.store');
        Route::redirect('profile', '/settings/profile')->name('profile');
    });

    Route::get('users/{user}/ewallet-qr', [EwalletQrController::class, 'show'])
        ->name('users.ewallet-qr.show');
});

require __DIR__.'/settings.php';
