<?php

namespace App\Http\Controllers\Staff;

use App\Actions\Staff\RetrieveExpiredItem;
use App\Enums\ItemStatus;
use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    /**
     * Display expired items and retrieved items ledger for staff.
     */
    public function index(Request $request): Response
    {
        $expiredItems = Item::query()
            ->where('status', ItemStatus::Expired)
            ->with(['seller:id,name,email', 'category:id,name'])
            ->latest('id')
            ->paginate(15, ['*'], 'expired_page')
            ->through(fn (Item $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'price' => $item->price,
                'shelf_location' => $item->shelf_location,
                'dropoff_qr_code' => $item->dropoff_qr_code,
                'seller' => [
                    'id' => $item->seller->id,
                    'name' => $item->seller->name,
                    'email' => $item->seller->email,
                ],
                'dropped_off_at' => $item->dropped_off_at?->toISOString(),
            ]);

        $retrievedItems = Item::query()
            ->where('status', ItemStatus::Retrieved)
            ->with(['seller:id,name,email', 'category:id,name'])
            ->latest('id')
            ->paginate(15, ['*'], 'retrieved_page')
            ->through(fn (Item $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'price' => $item->price,
                'seller' => [
                    'id' => $item->seller->id,
                    'name' => $item->seller->name,
                    'email' => $item->seller->email,
                ],
                'updated_at' => $item->updated_at?->toISOString(),
            ]);

        return Inertia::render('staff/returns', [
            'expiredItems' => $expiredItems,
            'retrievedItems' => $retrievedItems,
        ]);
    }

    /**
     * Mark an expired item as retrieved by its owner.
     */
    public function retrieve(Request $request, Item $item, RetrieveExpiredItem $action): RedirectResponse
    {
        /** @var User $staff */
        $staff = $request->user();

        $action->handle($staff, $item);

        return redirect()->back();
    }
}
