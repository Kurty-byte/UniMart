<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PayoutSettingsUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PayoutSettingsController extends Controller
{
    /**
     * Show the payout settings form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/payout', [
            'ewalletQrUrl' => $user->ewalletQrUrl(),
            'hasEwalletQr' => $user->hasEwalletQr(),
        ]);
    }

    /**
     * Update the user's e-wallet QR code.
     */
    public function update(PayoutSettingsUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->ewallet_qr_code && Storage::disk('local')->exists($user->ewallet_qr_code)) {
            Storage::disk('local')->delete($user->ewallet_qr_code);
        }

        $path = $request->file('ewallet_qr')->store("ewallet-qr/{$user->id}", 'local');
        $user->forceFill(['ewallet_qr_code' => $path])->save();

        return redirect()->route('payout.edit');
    }

    /**
     * Remove the user's e-wallet QR code.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->ewallet_qr_code && Storage::disk('local')->exists($user->ewallet_qr_code)) {
            Storage::disk('local')->delete($user->ewallet_qr_code);
        }

        $user->forceFill(['ewallet_qr_code' => null])->save();

        return redirect()->route('payout.edit');
    }
}
