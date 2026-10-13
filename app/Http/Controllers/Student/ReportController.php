<?php

namespace App\Http\Controllers\Student;

use App\Actions\Reports\CreateReport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreReportRequest;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display a listing of reports and disputes filed by the authenticated student.
     */
    public function index(Request $request): Response
    {
        $reports = $request->user()->filedReports()
            ->with([
                'item:id,title',
                'reportedUser:id,name,email',
            ])
            ->latest('id')
            ->paginate(10)
            ->through(fn (Report $report) => [
                'id' => $report->id,
                'reason' => $report->reason,
                'status' => $report->status->value,
                'resolution_notes' => $report->resolution_notes,
                'resolved_at' => $report->resolved_at?->toISOString(),
                'created_at' => $report->created_at?->toISOString(),
                'item' => $report->item ? [
                    'id' => $report->item->id,
                    'title' => $report->item->title,
                ] : null,
                'reported_user' => $report->reportedUser ? [
                    'id' => $report->reportedUser->id,
                    'name' => $report->reportedUser->name,
                    'email' => $report->reportedUser->email,
                ] : null,
            ]);

        return Inertia::render('student/reports', [
            'reports' => $reports,
        ]);
    }

    /**
     * Store a newly filed report or dispute.
     */
    public function store(StoreReportRequest $request, CreateReport $createReport): RedirectResponse
    {
        $createReport->handle($request->user(), $request->validated());

        return back()->with('success', 'Report submitted successfully. Campus administrators will review your concern.');
    }
}
