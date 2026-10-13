<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DrawerCount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftAuditController extends Controller
{
    /**
     * Display a listing of shift drawer counts with cash discrepancies.
     */
    public function index(Request $request): Response
    {
        $shifts = DrawerCount::query()
            ->with(['staff:id,name,email'])
            ->latest('id')
            ->paginate(15)
            ->through(fn (DrawerCount $shift) => [
                'id' => $shift->id,
                'staff' => $shift->staff ? [
                    'id' => $shift->staff->id,
                    'name' => $shift->staff->name,
                    'email' => $shift->staff->email,
                ] : null,
                'opening_cash' => $shift->opening_cash,
                'expected_cash' => $shift->expected_cash,
                'actual_cash' => $shift->actual_cash,
                'discrepancy' => $shift->actual_cash !== null && $shift->expected_cash !== null
                    ? number_format((float) $shift->actual_cash - (float) $shift->expected_cash, 2, '.', '')
                    : null,
                'notes' => $shift->notes,
                'shift_started_at' => $shift->shift_started_at?->toISOString(),
                'shift_ended_at' => $shift->shift_ended_at?->toISOString(),
            ]);

        return Inertia::render('admin/shift-audits', [
            'shifts' => $shifts,
        ]);
    }
}
