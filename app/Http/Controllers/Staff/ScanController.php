<?php

namespace App\Http\Controllers\Staff;

use App\Actions\Staff\ResolveQrCode;
use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\ResolveQrRequest;
use App\Models\Item;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ScanController extends Controller
{
    /**
     * Display the QR scanner interface.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('staff/scan', [
            'hasOpenShift' => $request->user()?->hasOpenShift() ?? false,
        ]);
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
            'has_open_shift' => $request->user()?->hasOpenShift() ?? false,
        ];

        if ($record instanceof Item) {
            $record->loadMissing('category:id,name', 'seller:id,name,email');
            $data['item'] = [
                'id' => $record->id,
                'title' => $record->title,
                'description' => $record->description,
                'condition' => $record->condition->value,
                'price' => $record->price,
                'quantity' => $record->quantity,
                'status' => $record->status->value,
                'shelf_location' => $record->shelf_location,
                'dropoff_qr_code' => $record->dropoff_qr_code,
                'image_urls' => $record->image_urls,
                'dropped_off_at' => $record->dropped_off_at?->toISOString(),
                'seller' => [
                    'id' => $record->seller->id,
                    'name' => $record->seller->name,
                    'email' => $record->seller->email,
                ],
                'category' => $record->category ? [
                    'id' => $record->category->id,
                    'name' => $record->category->name,
                ] : null,
            ];
        } elseif ($record instanceof Order) {
            $record->loadMissing('buyer:id,name,email', 'orderItems.item');
            $data['order'] = [
                'id' => $record->id,
                'status' => $record->status->value,
                'total_price' => $record->total_price,
                'claim_qr_code' => $record->claim_qr_code,
                'expires_at' => $record->expires_at?->toISOString(),
                'buyer' => [
                    'id' => $record->buyer->id,
                    'name' => $record->buyer->name,
                    'email' => $record->buyer->email,
                ],
                'items' => $record->orderItems->map(static function (OrderItem $orderItem): array {
                    $item = $orderItem->item;
                    $firstImage = $item?->images[0] ?? null;

                    return [
                        'id' => $orderItem->id,
                        'quantity' => $orderItem->quantity,
                        'price' => $orderItem->price,
                        'item' => $item ? [
                            'id' => $item->id,
                            'title' => $item->title,
                            'shelf_location' => $item->shelf_location,
                            'dropoff_qr_code' => $item->dropoff_qr_code,
                            'image_url' => $firstImage ? Storage::disk('public')->url($firstImage) : null,
                        ] : null,
                    ];
                })->all(),
            ];
        }

        return response()->json($data);
    }
}
