<?php

namespace App\Http\Controllers\Staff;

use App\Actions\Shifts\CalculateShiftExpectedCash;
use App\Actions\Shifts\CloseShift;
use App\Actions\Shifts\OpenShift;
use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\CloseShiftRequest;
use App\Http\Requests\Staff\OpenShiftRequest;
use App\Models\DrawerCount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DrawerCountController extends Controller
{
    /**
     * Display the drawer count and shift status page.
     */
    public function index(Request $request, CalculateShiftExpectedCash $calculateExpectedCash): Response
    {
        /** @var User $user */
        $user = $request->user();

        $activeShift = $user->activeShift();
        $activeShiftData = null;

        if ($activeShift) {
            $expectedCash = $calculateExpectedCash->handle($activeShift);
            $activeShiftData = [
                'id' => $activeShift->id,
                'opening_cash' => $activeShift->opening_cash,
                'expected_cash' => $expectedCash,
                'shift_started_at' => $activeShift->shift_started_at->toISOString(),
            ];
        }

        $pastShifts = DrawerCount::query()
            ->where('staff_id', $user->id)
            ->whereNotNull('shift_ended_at')
            ->latest('shift_ended_at')
            ->paginate(10)
            ->through(fn (DrawerCount $shift) => [
                'id' => $shift->id,
                'opening_cash' => $shift->opening_cash,
                'expected_cash' => $shift->expected_cash,
                'actual_cash' => $shift->actual_cash,
                'notes' => $shift->notes,
                'shift_started_at' => $shift->shift_started_at->toISOString(),
                'shift_ended_at' => $shift->shift_ended_at?->toISOString(),
            ]);

        return Inertia::render('staff/drawer-count', [
            'activeShift' => $activeShiftData,
            'pastShifts' => $pastShifts,
        ]);
    }

    /**
     * Open a new shift with the given opening cash float.
     */
    public function open(OpenShiftRequest $request, OpenShift $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->handle($user, (string) $request->validated('opening_cash'));

        return redirect()->route('staff.drawer-count');
    }

    /**
     * Close the currently active shift with the counted cash.
     */
    public function close(CloseShiftRequest $request, CloseShift $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $activeShift = $user->activeShift();
        if (! $activeShift) {
            abort(400, 'No active shift found to close.');
        }

        $action->handle(
            $activeShift,
            (string) $request->validated('actual_cash'),
            $request->validated('notes')
        );

        return redirect()->route('staff.drawer-count');
    }
}
