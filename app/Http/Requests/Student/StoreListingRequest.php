<?php

namespace App\Http\Requests\Student;

use App\Enums\ItemCondition;
use App\Models\Item;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreListingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Item::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $maxImages = (int) config('unimart.listing_max_images', 5);
        $maxKb = (int) config('unimart.listing_image_max_kb', 4096);

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:2000'],
            'condition' => ['required', Rule::enum(ItemCondition::class)],
            'price' => ['required', 'numeric', 'decimal:0,2', 'min:1', 'max:100000'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'images' => ['required', 'array', 'min:1', "max:{$maxImages}"],
            'images.*' => ['image', 'mimes:png,jpg,jpeg,webp', "max:{$maxKb}"],
        ];
    }
}
