<?php

namespace App\Actions\Reports;

use App\Enums\HubEvent;
use App\Enums\ReportStatus;
use App\Models\Item;
use App\Models\Report;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Validation\ValidationException;

class CreateReport
{
    /**
     * File a new dispute or report against an item or user.
     *
     * @param  array{item_id?: int|null, reported_user_id?: int|null, reason: string}  $data
     */
    public function handle(User $reporter, array $data): Report
    {
        $itemId = $data['item_id'] ?? null;
        $reportedUserId = $data['reported_user_id'] ?? null;
        $reason = trim($data['reason'] ?? '');

        if (! $itemId && ! $reportedUserId) {
            throw ValidationException::withMessages([
                'report' => ['You must report either a specific item or a student user.'],
            ]);
        }

        if ($itemId) {
            $item = Item::find($itemId);
            if (! $item) {
                throw ValidationException::withMessages([
                    'item_id' => ['The specified item does not exist.'],
                ]);
            }

            if ($item->seller_id === $reporter->id) {
                throw ValidationException::withMessages([
                    'item_id' => ['You cannot file a report against your own listing.'],
                ]);
            }

            // If reported_user_id was omitted, infer it from the item's seller
            if (! $reportedUserId) {
                $reportedUserId = $item->seller_id;
            }
        }

        if ($reportedUserId && (int) $reportedUserId === (int) $reporter->id) {
            throw ValidationException::withMessages([
                'reported_user_id' => ['You cannot file a report against yourself.'],
            ]);
        }

        $report = Report::create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $reportedUserId,
            'item_id' => $itemId,
            'reason' => $reason,
            'status' => ReportStatus::Pending,
        ]);

        HubAudit::record(
            HubEvent::ReportFiled,
            $report,
            $reporter,
            [
                'item_id' => $itemId,
                'reported_user_id' => $reportedUserId,
            ]
        );

        return $report;
    }
}
