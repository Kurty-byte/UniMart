<?php

namespace App\Http\Controllers\Staff;

use App\Actions\Staff\ResolveQrCode;
use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\ResolveQrRequest;
use App\Models\Item;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class ScanController extends Controller
{
    /**
     * Display the QR scanner interface.
     */
    public function index(): Response
    {
        return Inertia::render('staff/scan');
    }

    /**
     * Resolve a scanned QR code to an operational payload.
     */
    public function resolve(ResolveQrRequest $request, ResolveQrCode $action): JsonResponse
    {
        $result = $action->handle($request->validated('code'));

        $record = $result['record'];
        $data = [
            'type' => $result['type'],
            'actions' => $result['actions'],
        ];

        if ($record instanceof Item) {
            $record->loadMissing('category:id,name', 'seller:id,name');
            $data['item'] = [
                'id' => $record->id,
                'title' => $record->title,
                'condition' => $record->condition->value,
                'price' => $record->price,
                'quantity' => $record->quantity,
                'status' => $record->status->value,
                'shelf_location' => $record->shelf_location,
                'seller' => [
                    'id' => $record->seller->id,
                    'name' => $record->seller->name,
                ],
                'category' => $record->category ? [
                    'id' => $record->category->id,
                    'name' => $record->category->name,
                ] : null,
            ];
        } elseif ($record instanceof Order) {
            $record->loadMissing('buyer:id,name', 'orderItems.item');
            $data['order'] = [
                'id' => $record->id,
                'status' => $record->status->value,
                'total_price' => $record->total_price,
                'claim_qr_code' => $record->claim_qr_code,
                'expires_at' => $record->expires_at?->toISOString(),
                'buyer' => [
                    'id' => $record->buyer->id,
                    'name' => $record->buyer->name,
                ],
            ];
        }

        return response()->json($data);
    }
}
