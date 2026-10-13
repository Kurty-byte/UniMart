<?php

namespace App\Actions\Listings;

use App\Enums\ItemCondition;
use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class CreateListing
{
    /**
     * Create a new pending drop-off listing with stored images and a drop-off ULID code.
     *
     * @param  array{category_id: int, title: string, description: string, condition: string|ItemCondition, price: numeric-string|float|int, quantity: int}  $attributes
     * @param  array<UploadedFile>  $images
     */
    public function handle(User $seller, array $attributes, array $images): Item
    {
        $storedPaths = [];

        foreach ($images as $image) {
            $path = $image->store('items', 'public');
            $storedPaths[] = $path;
        }

        return Item::create([
            'seller_id' => $seller->id,
            'category_id' => $attributes['category_id'],
            'title' => $attributes['title'],
            'description' => $attributes['description'],
            'condition' => $attributes['condition'],
            'price' => $attributes['price'],
            'quantity' => $attributes['quantity'],
            'images' => $storedPaths,
            'status' => ItemStatus::PendingDropoff,
            'dropoff_qr_code' => (string) Str::ulid(),
        ]);
    }
}
