<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class EwalletQrController extends Controller
{
    /**
     * Stream the user's private e-wallet QR code.
     */
    public function show(Request $request, User $user): Response
    {
        Gate::authorize('viewEwalletQr', $user);

        if (! $user->ewallet_qr_code || ! Storage::disk('local')->exists($user->ewallet_qr_code)) {
            abort(404);
        }

        return Storage::disk('local')->response($user->ewallet_qr_code);
    }
}
