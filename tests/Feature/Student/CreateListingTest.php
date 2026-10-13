<?php

use App\Enums\ItemStatus;
use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => Storage::fake('public'));

function listingPayload(array $overrides = []): array
{
    return array_merge([
        'category_id' => Category::factory()->create()->id,
        'title' => 'PE Uniform (Medium)',
        'description' => 'Worn once, in great condition.',
        'condition' => 'like_new',
        'price' => '250.00',
        'quantity' => 2,
        'images' => [UploadedFile::fake()->image('front.jpg')],
    ], $overrides);
}

it('renders the create listing form with categories and conditions', function () {
    $student = User::factory()->student()->create();
    Category::factory()->create(['name' => 'Textbooks', 'parent_id' => null]);

    $this->actingAs($student)->get(route('student.listings.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/listings/create')
            ->has('categories')
            ->has('conditions'));
});

it('creates a pending drop-off listing with a ULID drop-off code', function () {
    $seller = User::factory()->student()->create();

    $response = $this->actingAs($seller)->post(route('student.listings.store'), listingPayload());

    $item = Item::sole();
    $response->assertRedirect(route('student.listings.show', $item));

    expect($item->status)->toBe(ItemStatus::PendingDropoff)
        ->and($item->seller_id)->toBe($seller->id)
        ->and($item->dropoff_qr_code)->toHaveLength(26)
        ->and($item->quantity)->toBe(2);

    Storage::disk('public')->assertExists($item->images[0]);
});

it('validates listing input', function (array $overrides, string $field) {
    $this->actingAs(User::factory()->student()->create())
        ->post(route('student.listings.store'), listingPayload($overrides))
        ->assertSessionHasErrors($field);
})->with([
    'no images' => [['images' => []], 'images'],
    'zero price' => [['price' => '0'], 'price'],
    'bad condition' => [['condition' => 'broken'], 'condition'],
    'too many units' => [['quantity' => 101], 'quantity'],
]);

it('forbids staff from creating listings', function () {
    $this->actingAs(User::factory()->staff()->create())
        ->post(route('student.listings.store'), listingPayload())
        ->assertForbidden();
});

it('hides a listing from other students', function () {
    $item = Item::factory()->pendingDropoff()->create();

    $this->actingAs(User::factory()->student()->create())
        ->get(route('student.listings.show', $item))
        ->assertForbidden();
});

it('shows the owner their drop-off code', function () {
    $item = Item::factory()->pendingDropoff()->create();

    $this->actingAs($item->seller->assignRole('student'))
        ->get(route('student.listings.show', $item))
        ->assertInertia(fn (Assert $page) => $page->component('student/listings/show')
            ->where('item.dropoff_qr_code', $item->dropoff_qr_code));
});
