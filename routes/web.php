<?php

use App\Actions\Cart\RefreshCartHold;
use App\Enums\OrderStatus;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\EwalletQrController;
use App\Http\Controllers\Student\CatalogController;
use App\Http\Controllers\Student\ListingController;
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
        Route::inertia('scan', 'staff/scan')->name('scan');
        Route::inertia('drop-offs', 'staff/drop-offs')->name('drop-offs');
        Route::inertia('claims', 'staff/claims')->name('claims');
        Route::inertia('returns', 'staff/returns')->name('returns');
        Route::inertia('payouts', 'staff/payouts')->name('payouts');
        Route::inertia('drawer-count', 'staff/drawer-count')->name('drawer-count');
    });

    // Admin Routes (Oversight & Management)
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::inertia('inventory', 'admin/inventory')->name('inventory');
        Route::get('categories', [CategoryController::class, 'index'])->name('categories');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::inertia('users', 'admin/users')->name('users');
        Route::inertia('finances', 'admin/finances')->name('finances');
        Route::inertia('shift-audits', 'admin/shift-audits')->name('shift-audits');
    });

    // Student Routes (Unified Seller and Buyer)
    Route::middleware(['role:student', RefreshCartSoftHold::class])->prefix('student')->name('student.')->group(function () {
        Route::get('browse', [CatalogController::class, 'index'])->name('browse');
        Route::get('items/{item}', [CatalogController::class, 'show'])->name('items.show');
        Route::inertia('cart', 'student/cart')->name('cart');
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
        })->name('cart.heartbeat');
        Route::inertia('saved', 'student/saved')->name('saved');

        Route::get('listings', [ListingController::class, 'index'])->name('listings.index');
        Route::get('listings/create', [ListingController::class, 'create'])->name('listings.create');
        Route::post('listings', [ListingController::class, 'store'])->name('listings.store');
        Route::get('listings/{item}', [ListingController::class, 'show'])->name('listings.show');
        Route::get('listings/{item}/edit', [ListingController::class, 'edit'])->name('listings.edit');
        Route::put('listings/{item}', [ListingController::class, 'update'])->name('listings.update');
        Route::delete('listings/{item}', [ListingController::class, 'destroy'])->name('listings.destroy');

        Route::inertia('claims', 'student/claims')->name('claims');
        Route::inertia('sales', 'student/sales')->name('sales');
        Route::inertia('returns', 'student/returns')->name('returns');
        Route::inertia('payouts', 'student/payouts')->name('payouts');

        Route::inertia('messages', 'student/messages')->name('messages');
        Route::redirect('profile', '/settings/profile')->name('profile');
    });

    Route::get('users/{user}/ewallet-qr', [EwalletQrController::class, 'show'])
        ->name('users.ewallet-qr.show');
});

require __DIR__.'/settings.php';
