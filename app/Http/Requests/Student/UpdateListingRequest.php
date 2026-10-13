<?php

namespace App\Http\Requests\Student;

use App\Enums\ItemCondition;
use App\Models\Item;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

class UpdateListingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $item = $this->route('item');

        return $this->user()?->can('update', $item) ?? false;
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
            'images' => ['nullable', 'array', "max:{$maxImages}"],
            'images.*' => ['image', 'mimes:png,jpg,jpeg,webp', "max:{$maxKb}"],
            'remove_images' => ['nullable', 'array'],
            'remove_images.*' => ['string'],
        ];
    }

    /**
     * Configure the validator instance and validate resulting image count.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function () {
            $item = $this->route('item');
            if (! $item instanceof Item) {
                return;
            }

            $currentCount = count($item->images ?? []);
            $removeCount = count($this->input('remove_images', []));
            $newCount = count($this->file('images', []));

            $total = $currentCount - $removeCount + $newCount;
            $maxImages = (int) config('unimart.listing_max_images', 5);

            if ($total < 1 || $total > $maxImages) {
                throw ValidationException::withMessages([
                    'images' => ["The listing must have between 1 and {$maxImages} images (currently {$total})."],
                ]);
            }
        });
    }
}
