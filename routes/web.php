<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        if ($user->hasRole('student') && ! $user->hasRole('admin')) {
            return redirect()->route('student.catalog');
        }

        return inertia('dashboard');
    })->name('dashboard');

    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::inertia('scan', 'admin/scan')->name('scan');
        Route::inertia('drop-offs', 'admin/drop-offs')->name('drop-offs');
        Route::inertia('claims', 'admin/claims')->name('claims');
        Route::inertia('returns', 'admin/returns')->name('returns');
        Route::inertia('payouts', 'admin/payouts')->name('payouts');
        Route::inertia('finances', 'admin/finances')->name('finances');
        Route::inertia('inventory', 'admin/inventory')->name('inventory');
        Route::inertia('categories', 'admin/categories')->name('categories');
    });

    // Student Routes (Unified Seller and Buyer)
    Route::middleware('role:student')->prefix('student')->name('student.')->group(function () {
        Route::inertia('catalog', 'student/catalog')->name('catalog');
        Route::inertia('cart', 'student/cart')->name('cart');
        Route::inertia('saved', 'student/saved')->name('saved');

        Route::inertia('listings', 'student/listings/index')->name('listings.index');
        Route::inertia('listings/create', 'student/listings/create')->name('listings.create');

        Route::inertia('claims', 'student/claims')->name('claims');
        Route::inertia('sales', 'student/sales')->name('sales');
        Route::inertia('returns', 'student/returns')->name('returns');
        Route::inertia('payouts', 'student/payouts')->name('payouts');

        Route::inertia('messages', 'student/messages')->name('messages');
        Route::inertia('profile', 'student/profile')->name('profile');
    });
});

require __DIR__.'/settings.php';
