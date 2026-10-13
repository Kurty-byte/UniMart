<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\ResolveReport;
use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResolveReportRequest;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display a listing of reports and disputes.
     */
    public function index(Request $request): Response
    {
        $reports = Report::query()
            ->with([
                'reporter:id,name,email',
                'reportedUser:id,name,email',
                'item:id,title',
                'resolvedBy:id,name',
            ])
            ->latest('id')
            ->paginate(15)
            ->through(fn (Report $report) => [
                'id' => $report->id,
                'reason' => $report->reason,
                'status' => $report->status->value,
                'resolution_notes' => $report->resolution_notes,
                'resolved_at' => $report->resolved_at?->toISOString(),
                'reporter' => $report->reporter ? [
                    'id' => $report->reporter->id,
                    'name' => $report->reporter->name,
                    'email' => $report->reporter->email,
                ] : null,
                'reported_user' => $report->reportedUser ? [
                    'id' => $report->reportedUser->id,
                    'name' => $report->reportedUser->name,
                    'email' => $report->reportedUser->email,
                ] : null,
                'item' => $report->item ? [
                    'id' => $report->item->id,
                    'title' => $report->item->title,
                ] : null,
                'resolved_by' => $report->resolvedBy ? [
                    'id' => $report->resolvedBy->id,
                    'name' => $report->resolvedBy->name,
                ] : null,
                'created_at' => $report->created_at?->toISOString(),
            ]);

        return Inertia::render('admin/reports', [
            'reports' => $reports,
        ]);
    }

    /**
     * Resolve a reported dispute or complaint.
     */
    public function resolve(ResolveReportRequest $request, Report $report, ResolveReport $action): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $action->handle(
            $admin,
            $report,
            ReportStatus::from($request->validated('status')),
            $request->validated('resolution_notes')
        );

        return redirect()->back();
    }
}
