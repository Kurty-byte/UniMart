<?php

namespace App\Actions\Admin;

use App\Enums\HubEvent;
use App\Enums\ReportStatus;
use App\Models\Report;
use App\Models\User;
use App\Support\HubAudit;

class ResolveReport
{
    /**
     * Resolve a reported dispute or complaint with administrative resolution notes.
     */
    public function handle(User $admin, Report $report, ReportStatus $status, string $notes): Report
    {
        $report->update([
            'status' => $status,
            'resolution_notes' => $notes,
            'resolved_by' => $admin->id,
            'resolved_at' => now(),
        ]);

        HubAudit::record(
            HubEvent::ReportResolved,
            $report,
            $admin,
            [
                'status' => $status->value,
                'resolution_notes' => $notes,
            ]
        );

        return $report->fresh();
    }
}
