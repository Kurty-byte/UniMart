<?php

namespace App\Http\Controllers\Admin;

use App\Enums\HubEvent;
use App\Enums\SettingKey;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Setting;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display current administrative system timer settings.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Setting::class);

        return Inertia::render('admin/settings', [
            'settings' => [
                'cart_soft_hold_minutes' => Setting::integer(SettingKey::CartSoftHoldMinutes),
                'order_hard_hold_hours' => Setting::integer(SettingKey::OrderHardHoldHours),
                'item_shelf_expiry_days' => Setting::integer(SettingKey::ItemShelfExpiryDays),
            ],
        ]);
    }

    /**
     * Update system timer configurations.
     */
    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $validated = $request->validated();

        foreach ($validated as $key => $value) {
            Setting::put(SettingKey::from($key), (int) $value);
        }

        HubAudit::record(
            HubEvent::SettingsUpdated,
            $admin,
            $admin,
            $validated
        );

        return redirect()->back();
    }
}
