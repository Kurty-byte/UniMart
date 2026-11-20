<?php

namespace App\Http\Controllers\Student;

use App\Enums\ItemStatus;
use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    /**
     * Display the student's expired items awaiting retrieval, rejected drop-offs, and retrieved history.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $formatItem = static function (Item $item): array {
            $canShowQr = $item->status === ItemStatus::Expired;

            return [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'condition' => $item->condition->value,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'status' => $item->status->value,
                'image_urls' => $item->image_urls,
                'category' => $item->category ? [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ] : null,
                'dropoff_qr_code' => $canShowQr ? $item->dropoff_qr_code : null,
                'dropoff_qr_code_svg' => $canShowQr ? $item->dropoffQrCodeSvg() : null,
                'shelf_location' => $item->shelf_location,
                'rejection_reason' => $item->rejection_reason,
                'dropped_off_at' => $item->dropped_off_at?->toISOString(),
                'shelf_expires_at' => $item->shelfExpiresAt()?->toISOString(),
                'updated_at' => $item->updated_at?->toISOString(),
                'created_at' => $item->created_at?->toISOString(),
            ];
        };

        $expiredItems = Item::query()
            ->ownedBy($user)
            ->where('status', ItemStatus::Expired)
            ->with('category:id,name')
            ->latest('id')
            ->get()
            ->map($formatItem)
            ->all();

        $rejectedItems = Item::query()
            ->ownedBy($user)
            ->where('status', ItemStatus::Rejected)
            ->with('category:id,name')
            ->latest('id')
            ->get()
            ->map($formatItem)
            ->all();

        $retrievedItems = Item::query()
            ->ownedBy($user)
            ->where('status', ItemStatus::Retrieved)
            ->with('category:id,name')
            ->latest('updated_at')
            ->get()
            ->map($formatItem)
            ->all();

        return Inertia::render('student/returns', [
            'expiredItems' => $expiredItems,
            'rejectedItems' => $rejectedItems,
            'retrievedItems' => $retrievedItems,
        ]);
    }
}
