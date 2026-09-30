<?php

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
        Route::inertia('categories', 'admin/categories')->name('categories');
        Route::inertia('users', 'admin/users')->name('users');
        Route::inertia('finances', 'admin/finances')->name('finances');
        Route::inertia('shift-audits', 'admin/shift-audits')->name('shift-audits');
    });

    // Student Routes (Unified Seller and Buyer)
    Route::middleware('role:student')->prefix('student')->name('student.')->group(function () {
        Route::inertia('browse', 'student/browse')->name('browse');
        Route::inertia('cart', 'student/cart')->name('cart');
        Route::inertia('saved', 'student/saved')->name('saved');

        Route::inertia('listings', 'student/listings/index')->name('listings.index');
        Route::inertia('listings/create', 'student/listings/create')->name('listings.create');

        Route::inertia('claims', 'student/claims')->name('claims');
        Route::inertia('sales', 'student/sales')->name('sales');
        Route::inertia('returns', 'student/returns')->name('returns');
        Route::inertia('payouts', 'student/payouts')->name('payouts');

        Route::inertia('messages', 'student/messages')->name('messages');
        Route::redirect('profile', '/settings/profile')->name('profile');
    });
});

require __DIR__.'/settings.php';
