<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Models\DrawerCount;
use App\Models\Item;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    /**
     * Display the executive administrative dashboard with marketplace KPIs and recent hub audit activity.
     */
    public function __invoke(Request $request): Response
    {
        $totalSales = number_format(
            (float) Order::query()
                ->where('status', OrderStatus::Completed)
                ->sum('total_price'),
            2,
            '.',
            ''
        );

        $pendingPayoutsTotal = number_format(
            (float) OrderItem::query()
                ->where('payout_status', PayoutStatus::Pending)
                ->whereHas('order', fn ($q) => $q->where('status', OrderStatus::Completed))
                ->sum(DB::raw('price * quantity')),
            2,
            '.',
            ''
        );

        $cashHeldTotal = number_format(
            (float) OrderItem::query()
                ->where('payout_status', PayoutStatus::CashHeld)
                ->sum(DB::raw('price * quantity')),
            2,
            '.',
            ''
        );

        $recentAuditLogs = Activity::query()
            ->inLog('hub')
            ->with(['causer:id,name,email'])
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(fn (Activity $act) => [
                'id' => $act->id,
                'event' => $act->event,
                'description' => $act->description,
                'causer' => $act->causer ? [
                    'id' => $act->causer->id,
                    'name' => $act->causer->name,
                ] : null,
                'subject_type' => $act->subject_type ? class_basename($act->subject_type) : null,
                'subject_id' => $act->subject_id,
                'created_at' => $act->created_at?->toISOString(),
            ])
            ->all();

        return Inertia::render('dashboard', [
            'metrics' => [
                'totalSales' => $totalSales,
                'pendingPayoutsTotal' => $pendingPayoutsTotal,
                'cashHeldTotal' => $cashHeldTotal,
                'completedOrdersCount' => Order::query()->where('status', OrderStatus::Completed)->count(),
                'availableItemsCount' => Item::query()->where('status', ItemStatus::Available)->where('quantity', '>', 0)->count(),
                'pendingDropoffsCount' => Item::query()->where('status', ItemStatus::PendingDropoff)->count(),
                'pendingClaimsCount' => Order::query()->where('status', OrderStatus::PendingHandover)->count(),
                'expiredItemsCount' => Item::query()->where('status', ItemStatus::Expired)->count(),
                'openShiftsCount' => DrawerCount::query()->whereNull('shift_ended_at')->count(),
                'pendingReportsCount' => Report::query()->where('status', ReportStatus::Pending)->count(),
                'totalStudentsCount' => User::role('student')->count(),
                'totalStaffCount' => User::role('staff')->count(),
            ],
            'recentAuditLogs' => $recentAuditLogs,
        ]);
    }
}
