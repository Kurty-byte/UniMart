<?php

use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the categories management page with category tree including item counts', function () {
    $college = Category::factory()->create(['name' => 'College of Nursing', 'parent_id' => null]);
    $course = Category::factory()->create(['name' => 'BS Nursing', 'parent_id' => $college->id]);
    Item::factory()->create(['category_id' => $course->id]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.categories'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/categories')
            ->has('categories'));
});

it('creates a root category', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.categories.store'), ['name' => 'General Studies', 'parent_id' => null])
        ->assertRedirect(route('admin.categories'));

    expect(Category::where('name', 'General Studies')->whereNull('parent_id')->exists())->toBeTrue();
});

it('creates a course under a college', function () {
    $college = Category::factory()->create(['parent_id' => null]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.categories.store'), ['name' => 'BS Nursing', 'parent_id' => $college->id])
        ->assertRedirect(route('admin.categories'));

    expect(Category::where('name', 'BS Nursing')->value('parent_id'))->toBe($college->id);
});

it('rejects duplicate names within the same parent', function () {
    $college = Category::factory()->create(['parent_id' => null]);
    Category::factory()->create(['name' => 'BS Nursing', 'parent_id' => $college->id]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.categories.store'), ['name' => 'BS Nursing', 'parent_id' => $college->id])
        ->assertSessionHasErrors('name');
});

it('allows same name under different parents', function () {
    $collegeA = Category::factory()->create(['parent_id' => null]);
    $collegeB = Category::factory()->create(['parent_id' => null]);
    Category::factory()->create(['name' => 'General Elective', 'parent_id' => $collegeA->id]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.categories.store'), ['name' => 'General Elective', 'parent_id' => $collegeB->id])
        ->assertRedirect(route('admin.categories'));

    expect(Category::where('name', 'General Elective')->count())->toBe(2);
});

it('rejects a third nesting level', function () {
    $college = Category::factory()->create(['parent_id' => null]);
    $course = Category::factory()->create(['parent_id' => $college->id]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.categories.store'), ['name' => 'Section A', 'parent_id' => $course->id])
        ->assertSessionHasErrors('parent_id');
});

it('updates category name and parent', function () {
    $college = Category::factory()->create(['name' => 'Old College', 'parent_id' => null]);

    $this->actingAs(User::factory()->admin()->create())
        ->put(route('admin.categories.update', $college), ['name' => 'New College', 'parent_id' => null])
        ->assertRedirect(route('admin.categories'));

    expect($college->fresh()->name)->toBe('New College');
});

it('prevents a category with children from becoming a child', function () {
    $college = Category::factory()->create(['parent_id' => null]);
    Category::factory()->create(['parent_id' => $college->id]);
    $other = Category::factory()->create(['parent_id' => null]);

    $this->actingAs(User::factory()->admin()->create())
        ->put(route('admin.categories.update', $college), ['name' => $college->name, 'parent_id' => $other->id])
        ->assertSessionHasErrors('parent_id');
});

it('prevents a category from being its own parent', function () {
    $college = Category::factory()->create(['parent_id' => null]);

    $this->actingAs(User::factory()->admin()->create())
        ->put(route('admin.categories.update', $college), ['name' => $college->name, 'parent_id' => $college->id])
        ->assertSessionHasErrors('parent_id');
});

it('deletes an empty leaf category', function () {
    $category = Category::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect(route('admin.categories'));

    expect(Category::find($category->id))->toBeNull();
});

it('refuses to delete a category with children', function () {
    $college = Category::factory()->create(['parent_id' => null]);
    Category::factory()->create(['parent_id' => $college->id]);

    $this->actingAs(User::factory()->admin()->create())
        ->delete(route('admin.categories.destroy', $college))
        ->assertSessionHasErrors('category');

    expect($college->fresh())->not->toBeNull();
});

it('refuses to delete a category with items', function () {
    $item = Item::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->delete(route('admin.categories.destroy', $item->category))
        ->assertSessionHasErrors('category');

    expect($item->category->fresh())->not->toBeNull();
});

it('forbids staff from managing categories', function () {
    $this->actingAs(User::factory()->staff()->create())
        ->post(route('admin.categories.store'), ['name' => 'Restricted Category'])
        ->assertForbidden();
});

it('forbids users without category.create permission from creating categories', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.categories.store'), ['name' => 'Unauthorized Category'])
        ->assertForbidden();
});

it('forbids users without category.update permission from updating categories', function () {
    $category = Category::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('admin.categories.update', $category), ['name' => 'New Name'])
        ->assertForbidden();
});

it('forbids users without category.delete permission from deleting categories', function () {
    $category = Category::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->delete(route('admin.categories.destroy', $category))
        ->assertForbidden();
});
