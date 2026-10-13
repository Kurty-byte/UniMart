<?php

namespace App\Actions\Shifts;

use App\Enums\HubEvent;
use App\Models\DrawerCount;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Validation\ValidationException;

class OpenShift
{
    /**
     * Open a new staff shift with an opening float.
     */
    public function handle(User $staff, string $openingCash): DrawerCount
    {
        if ($staff->hasOpenShift()) {
            throw ValidationException::withMessages([
                'shift' => ['You already have an active open shift.'],
            ]);
        }

        $shift = DrawerCount::create([
            'staff_id' => $staff->id,
            'opening_cash' => $openingCash,
            'shift_started_at' => now(),
        ]);

        HubAudit::record(
            HubEvent::ShiftOpened,
            $shift,
            $staff,
            ['opening_cash' => $openingCash]
        );

        return $shift;
    }
}
