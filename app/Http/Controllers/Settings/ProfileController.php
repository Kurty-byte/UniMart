<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'ewalletQrUrl' => $user->ewalletQrUrl(),
            'hasEwalletQr' => $user->hasEwalletQr(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->fill($request->safe()->only([
            'name',
            'email',
            'ewallet_provider',
            'ewallet_account_name',
            'ewallet_account_number',
        ]));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->filled('qr_payload')) {
            $user->ewallet_qr_payload = $request->input('qr_payload');
        }

        // Handle Avatar
        if ($request->boolean('remove_avatar') && ! $request->hasFile('avatar')) {
            $rawAvatar = $user->getRawOriginal('avatar');
            if ($rawAvatar && Storage::disk('public')->exists($rawAvatar)) {
                Storage::disk('public')->delete($rawAvatar);
            }
            $user->avatar = null;
        } elseif ($request->hasFile('avatar')) {
            $rawAvatar = $user->getRawOriginal('avatar');
            if ($rawAvatar && Storage::disk('public')->exists($rawAvatar)) {
                Storage::disk('public')->delete($rawAvatar);
            }
            $path = $request->file('avatar')->store("avatars/{$user->id}", 'public');
            $user->avatar = $path;
        }

        // Handle E-wallet QR
        if ($request->boolean('remove_ewallet_qr') && ! $request->hasFile('ewallet_qr')) {
            if ($user->ewallet_qr_code && Storage::disk('local')->exists($user->ewallet_qr_code)) {
                Storage::disk('local')->delete($user->ewallet_qr_code);
            }
            $user->ewallet_qr_code = null;
            $user->ewallet_qr_payload = null;
        } elseif ($request->hasFile('ewallet_qr')) {
            if ($user->ewallet_qr_code && Storage::disk('local')->exists($user->ewallet_qr_code)) {
                Storage::disk('local')->delete($user->ewallet_qr_code);
            }
            $path = $request->file('ewallet_qr')->store("ewallet-qr/{$user->id}", 'local');
            $user->ewallet_qr_code = $path;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated successfully.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
