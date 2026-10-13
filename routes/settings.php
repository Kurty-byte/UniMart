<?php

use App\Http\Controllers\Settings\PayoutSettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/payout', [PayoutSettingsController::class, 'edit'])->name('payout.edit');
    Route::put('settings/payout', [PayoutSettingsController::class, 'update'])->name('payout.update');
    Route::delete('settings/payout', [PayoutSettingsController::class, 'destroy'])->name('payout.destroy');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});
