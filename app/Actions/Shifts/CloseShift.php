<?php

namespace App\Actions\Shifts;

use App\Enums\HubEvent;
use App\Models\DrawerCount;
use App\Support\HubAudit;
use Illuminate\Validation\ValidationException;

class CloseShift
{
    public function __construct(
        protected CalculateShiftExpectedCash $calculateExpectedCash
    ) {}

    /**
     * Close an active shift with actual counted cash and discrepancy notes.
     */
    public function handle(DrawerCount $shift, string $actualCash, ?string $notes = null): DrawerCount
    {
        if ($shift->shift_ended_at !== null) {
            throw ValidationException::withMessages([
                'shift' => ['This shift has already been closed.'],
            ]);
        }

        $now = now();
        $shift->shift_ended_at = $now;

        $expectedCash = $this->calculateExpectedCash->handle($shift);
        $discrepancy = (float) $actualCash - (float) $expectedCash;

        $shift->update([
            'shift_ended_at' => $now,
            'expected_cash' => $expectedCash,
            'actual_cash' => $actualCash,
            'notes' => $notes,
        ]);

        HubAudit::record(
            HubEvent::ShiftClosed,
            $shift,
            $shift->staff,
            [
                'expected_cash' => $expectedCash,
                'actual_cash' => $actualCash,
                'discrepancy' => number_format($discrepancy, 2, '.', ''),
                'notes' => $notes,
            ]
        );

        return $shift->fresh();
    }
}
