<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manage categories') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Category $category */
        $category = $this->route('category');
        $parentId = $this->input('parent_id');

        return [
            'name' => [
                'required',
                'string',
                'max:80',
                Rule::unique('categories', 'name')
                    ->where('parent_id', $parentId)
                    ->ignore($category->id),
            ],
            'parent_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
                function (string $attribute, mixed $value, \Closure $fail) use ($category) {
                    if ($value === null) {
                        return;
                    }

                    if ((int) $value === $category->id) {
                        $fail('A category cannot be its own parent.');

                        return;
                    }

                    if ($category->children()->exists()) {
                        $fail('A category with sub-categories cannot be nested under another category.');

                        return;
                    }

                    $parent = Category::find($value);
                    if ($parent && ! $parent->isRoot()) {
                        $fail('A sub-category cannot be selected as a parent (maximum 2 levels).');
                    }
                },
            ],
        ];
    }
}
