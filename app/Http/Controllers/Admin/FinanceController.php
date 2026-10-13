<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class FinanceController extends Controller
{
    /**
     * Display marketplace financial metrics and operational audit logs.
     */
    public function index(Request $request): Response
    {
        $totalSales = number_format(
            (float) Order::query()
                ->where('status', OrderStatus::Completed)
                ->sum('total_price'),
            2,
            '.',
            ''
        );

        $pendingPayouts = number_format(
            (float) OrderItem::query()
                ->where('payout_status', PayoutStatus::Pending)
                ->sum(DB::raw('price * quantity')),
            2,
            '.',
            ''
        );

        $disbursedCash = number_format(
            (float) OrderItem::query()
                ->where('payout_status', PayoutStatus::CashClaimed)
                ->sum(DB::raw('price * quantity')),
            2,
            '.',
            ''
        );

        $disbursedDigital = number_format(
            (float) OrderItem::query()
                ->where('payout_status', PayoutStatus::PaidDigitally)
                ->sum(DB::raw('price * quantity')),
            2,
            '.',
            ''
        );

        $auditLogs = Activity::query()
            ->inLog('hub')
            ->with(['causer:id,name,email'])
            ->latest('id')
            ->paginate(20)
            ->through(fn (Activity $act) => [
                'id' => $act->id,
                'event' => $act->event,
                'description' => $act->description,
                'properties' => $act->properties,
                'causer' => $act->causer ? [
                    'id' => $act->causer->id,
                    'name' => $act->causer->name,
                    'email' => $act->causer->email,
                ] : null,
                'subject_type' => $act->subject_type ? class_basename($act->subject_type) : null,
                'subject_id' => $act->subject_id,
                'created_at' => $act->created_at?->toISOString(),
            ]);

        return Inertia::render('admin/finances', [
            'metrics' => [
                'totalSales' => $totalSales,
                'pendingPayouts' => $pendingPayouts,
                'disbursedCash' => $disbursedCash,
                'disbursedDigital' => $disbursedDigital,
            ],
            'auditLogs' => $auditLogs,
        ]);
    }
}
