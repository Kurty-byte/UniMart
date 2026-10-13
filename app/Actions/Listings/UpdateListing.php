<?php

namespace App\Actions\Listings;

use App\Enums\ItemCondition;
use App\Models\Item;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateListing
{
    /**
     * Update a pending drop-off listing, optionally replacing or appending images.
     *
     * @param  array{category_id: int, title: string, description: string, condition: string|ItemCondition, price: numeric-string|float|int, quantity: int}  $attributes
     * @param  array<UploadedFile>|null  $newImages
     * @param  array<string>  $removeImagePaths
     */
    public function handle(Item $item, array $attributes, ?array $newImages = null, array $removeImagePaths = []): Item
    {
        $currentImages = $item->images ?? [];

        // Delete requested removed images from public disk
        if (! empty($removeImagePaths)) {
            foreach ($removeImagePaths as $path) {
                if (in_array($path, $currentImages, true)) {
                    Storage::disk('public')->delete($path);
                }
            }
            $currentImages = array_values(array_diff($currentImages, $removeImagePaths));
        }

        // Store new images
        if (! empty($newImages)) {
            foreach ($newImages as $image) {
                $path = $image->store('items', 'public');
                $currentImages[] = $path;
            }
        }

        $item->update([
            'category_id' => $attributes['category_id'],
            'title' => $attributes['title'],
            'description' => $attributes['description'],
            'condition' => $attributes['condition'],
            'price' => $attributes['price'],
            'quantity' => $attributes['quantity'],
            'images' => $currentImages,
        ]);

        return $item;
    }
}
