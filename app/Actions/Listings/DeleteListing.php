<?php

namespace App\Actions\Listings;

use App\Models\Item;
use Illuminate\Support\Facades\Storage;

class DeleteListing
{
    /**
     * Delete a pending drop-off listing, removing its images from disk and soft-deleting the record.
     */
    public function handle(Item $item): void
    {
        $images = $item->images ?? [];

        foreach ($images as $path) {
            Storage::disk('public')->delete($path);
        }

        $item->delete();
    }
}
