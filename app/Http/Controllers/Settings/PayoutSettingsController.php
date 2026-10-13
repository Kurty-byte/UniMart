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
            'ewalletProvider' => $user->ewallet_provider,
            'ewalletAccountName' => $user->ewallet_account_name,
            'ewalletAccountNumber' => $user->ewallet_account_number,
        ]);
    }

    /**
     * Update the user's e-wallet settings.
     */
    public function update(PayoutSettingsUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $updates = [];

        if ($request->has('ewallet_provider')) {
            $updates['ewallet_provider'] = $request->input('ewallet_provider');
        }

        if ($request->has('ewallet_account_name')) {
            $updates['ewallet_account_name'] = $request->input('ewallet_account_name');
        }

        if ($request->has('ewallet_account_number')) {
            $updates['ewallet_account_number'] = $request->input('ewallet_account_number');
        }

        if ($request->has('qr_payload')) {
            $updates['ewallet_qr_payload'] = $request->input('qr_payload');
        }

        if ($request->hasFile('ewallet_qr')) {
            if ($user->ewallet_qr_code && Storage::disk('local')->exists($user->ewallet_qr_code)) {
                Storage::disk('local')->delete($user->ewallet_qr_code);
            }

            $path = $request->file('ewallet_qr')->store("ewallet-qr/{$user->id}", 'local');
            $updates['ewallet_qr_code'] = $path;
        }

        $user->forceFill($updates)->save();

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

        $user->forceFill([
            'ewallet_qr_code' => null,
            'ewallet_qr_payload' => null,
        ])->save();

        return redirect()->route('payout.edit');
    }
}
