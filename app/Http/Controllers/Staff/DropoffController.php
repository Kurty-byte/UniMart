<?php

namespace App\Http\Controllers\Staff;

use App\Actions\Staff\ApproveItemDropoff;
use App\Actions\Staff\RejectItemDropoff;
use App\Enums\ItemStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\ApproveDropoffRequest;
use App\Http\Requests\Staff\RejectDropoffRequest;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DropoffController extends Controller
{
    /**
     * Display pending drop-offs list.
     */
    public function index(Request $request): Response
    {

        $pendingItems = Item::query()
            ->where('status', ItemStatus::PendingDropoff)
            ->with(['seller:id,name,email', 'category:id,name'])
            ->latest('id')
            ->paginate(15)
            ->through(fn (Item $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'condition' => $item->condition->value,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'dropoff_qr_code' => $item->dropoff_qr_code,
                'seller' => [
                    'id' => $item->seller->id,
                    'name' => $item->seller->name,
                    'email' => $item->seller->email,
                ],
                'category' => $item->category ? [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ] : null,
                'created_at' => $item->created_at?->toISOString(),
            ]);

        return Inertia::render('staff/drop-offs', [
            'pendingItems' => $pendingItems,
        ]);
    }

    /**
     * Approve an item drop-off and assign a shelf location.
     */
    public function approve(ApproveDropoffRequest $request, Item $item, ApproveItemDropoff $action): RedirectResponse
    {
        /** @var User $staff */
        $staff = $request->user();

        $action->handle($staff, $item, $request->validated('shelf_location'));

        return redirect()->back();
    }

    /**
     * Reject an item drop-off with a stated reason.
     */
    public function reject(RejectDropoffRequest $request, Item $item, RejectItemDropoff $action): RedirectResponse
    {
        /** @var User $staff */
        $staff = $request->user();

        $action->handle($staff, $item, $request->validated('rejection_reason'));

        return redirect()->back();
    }

    /**
     * Return printable tracking tag data for an approved item.
     */
    public function tag(Request $request, Item $item): JsonResponse
    {
        $item->loadMissing('category:id,name', 'seller:id,name');

        return response()->json([
            'id' => $item->id,
            'title' => $item->title,
            'price' => $item->price,
            'shelf_location' => $item->shelf_location,
            'dropoff_qr_code' => $item->dropoff_qr_code,
            'seller_name' => $item->seller?->name,
            'category_name' => $item->category?->name,
            'dropped_off_at' => $item->dropped_off_at?->toISOString(),
        ]);
    }
}
