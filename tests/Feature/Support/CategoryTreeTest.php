<?php

use App\Models\Category;

it('identifies if a category is a root category', function () {
    $root = Category::factory()->create(['parent_id' => null]);
    $child = Category::factory()->create(['parent_id' => $root->id]);

    expect($root->isRoot())->toBeTrue()
        ->and($child->isRoot())->toBeFalse();
});

it('scopes query to root categories', function () {
    $root = Category::factory()->create(['parent_id' => null]);
    Category::factory()->create(['parent_id' => $root->id]);

    $roots = Category::roots()->get();
    expect($roots->pluck('id'))->toContain($root->id)
        ->and($roots->every(fn (Category $c) => $c->parent_id === null))->toBeTrue();
});

it('returns a category and its children ids', function () {
    $college = Category::factory()->create(['parent_id' => null]);
    $courses = Category::factory()->count(2)->create(['parent_id' => $college->id]);

    expect($college->selfAndChildIds())->toEqualCanonicalizing([$college->id, ...$courses->pluck('id')]);
});

it('builds a sorted two-level tree', function () {
    $b = Category::factory()->create(['name' => 'B College', 'parent_id' => null]);
    $a = Category::factory()->create(['name' => 'A College', 'parent_id' => null]);
    Category::factory()->create(['name' => 'Z course', 'parent_id' => $b->id]);
    Category::factory()->create(['name' => 'A course', 'parent_id' => $b->id]);

    $tree = Category::tree();

    expect($tree->pluck('name')->all())->toContain('A College', 'B College');

    $bNode = $tree->firstWhere('name', 'B College');
    expect($bNode)->not->toBeNull()
        ->and($bNode['children'][0]['name'])->toBe('A course')
        ->and($bNode['children'][1]['name'])->toBe('Z course');
});
