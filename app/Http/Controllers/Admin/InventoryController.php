<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\TakeDownItem;
use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display a listing of items across the marketplace.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $items = Item::query()
            ->with(['seller:id,name,email', 'category:id,name'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest('id')
            ->paginate(15)
            ->through(fn (Item $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'condition' => $item->condition->value,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'status' => $item->status->value,
                'shelf_location' => $item->shelf_location,
                'dropoff_qr_code' => $item->dropoff_qr_code,
                'seller' => $item->seller ? [
                    'id' => $item->seller->id,
                    'name' => $item->seller->name,
                    'email' => $item->seller->email,
                ] : null,
                'category' => $item->category ? [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ] : null,
                'created_at' => $item->created_at?->toISOString(),
            ]);

        return Inertia::render('admin/inventory', [
            'items' => $items,
            'selectedStatus' => $status,
        ]);
    }

    /**
     * Take down an unsold item from the catalog.
     */
    public function takeDown(Request $request, Item $item, TakeDownItem $action): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $action->handle($admin, $item, $request->input('reason'));

        return redirect()->back();
    }
}
