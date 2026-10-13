<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class PayoutSettingsUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'ewallet_qr' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];
    }
}
