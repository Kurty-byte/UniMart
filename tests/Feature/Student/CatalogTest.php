<?php

use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows only purchasable items in the catalog', function () {
    $visible = Item::factory()->create();
    Item::factory()->pendingDropoff()->create();
    Item::factory()->sold()->create();
    Item::factory()->create(['quantity' => 0]);
    Item::factory()->for(User::factory()->suspended(), 'seller')->create();

    $this->actingAs(User::factory()->student()->create())
        ->get(route('student.browse'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/browse')
            ->has('items.data', 1)
            ->where('items.data.0.id', $visible->id)
            ->has('categories')
            ->has('conditions')
            ->has('filters'));
});

it('filters by college including its courses', function () {
    $college = Category::factory()->create(['parent_id' => null]);
    $course = Category::factory()->create(['parent_id' => $college->id]);
    $targetItem = Item::factory()->for($course)->create();
    Item::factory()->create(); // other category

    $this->actingAs(User::factory()->student()->create())
        ->get(route('student.browse', ['category' => $college->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/browse')
            ->has('items.data', 1)
            ->where('items.data.0.id', $targetItem->id));
});

it('searches by keyword across title and description', function () {
    $matched = Item::factory()->create(['title' => 'Biology Textbook 10th Ed']);
    $matchedDesc = Item::factory()->create(['title' => 'Notebook', 'description' => 'Great for biology lab notes']);
    Item::factory()->create(['title' => 'Chemistry Book', 'description' => 'Organic chemistry']);

    $this->actingAs(User::factory()->student()->create())
        ->get(route('student.browse', ['search' => 'biology']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/browse')
            ->has('items.data', 2));
});

it('filters by price range and sorts by price ascending', function () {
    Item::factory()->create(['price' => '100.00']);
    $mid = Item::factory()->create(['price' => '300.00']);
    $high = Item::factory()->create(['price' => '500.00']);

    $this->actingAs(User::factory()->student()->create())
        ->get(route('student.browse', [
            'min_price' => '150.00',
            'max_price' => '600.00',
            'sort' => 'price_asc',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/browse')
            ->has('items.data', 2)
            ->where('items.data.0.id', $mid->id)
            ->where('items.data.1.id', $high->id));
});

it('sorts by price descending', function () {
    $low = Item::factory()->create(['price' => '100.00']);
    $high = Item::factory()->create(['price' => '500.00']);

    $this->actingAs(User::factory()->student()->create())
        ->get(route('student.browse', ['sort' => 'price_desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/browse')
            ->where('items.data.0.id', $high->id)
            ->where('items.data.1.id', $low->id));
});

it('flags my own listings in the catalog', function () {
    $me = User::factory()->student()->create();
    $myItem = Item::factory()->for($me, 'seller')->create();
    $otherItem = Item::factory()->create();

    $this->actingAs($me)
        ->get(route('student.browse'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/browse')
            ->where('items.data', fn ($data) => collect($data)->firstWhere('id', $myItem->id)['is_own'] === true
                && collect($data)->firstWhere('id', $otherItem->id)['is_own'] === false));
});

it('rejects invalid filters', function (array $query, string $field) {
    $this->actingAs(User::factory()->student()->create())
        ->get(route('student.browse', $query))
        ->assertSessionHasErrors($field);
})->with([
    'invalid sort' => [['sort' => 'drop'], 'sort'],
    'negative min_price' => [['min_price' => -1], 'min_price'],
    'max_price less than min_price' => [['min_price' => 500, 'max_price' => 100], 'max_price'],
    'invalid category' => [['category' => 999999], 'category'],
]);
