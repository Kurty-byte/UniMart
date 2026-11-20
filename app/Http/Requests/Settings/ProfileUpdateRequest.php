<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use App\Support\EmvcoQrValidator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules($this->user()->id),
            'avatar' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'remove_avatar' => ['nullable', 'boolean'],
            'ewallet_provider' => ['nullable', 'string', 'max:50'],
            'ewallet_account_name' => ['nullable', 'string', 'max:100'],
            'ewallet_account_number' => ['nullable', 'string', 'max:50'],
            'ewallet_qr' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'remove_ewallet_qr' => ['nullable', 'boolean'],
            'qr_payload' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->filled('qr_payload')) {
                $payloadError = EmvcoQrValidator::validate((string) $this->input('qr_payload'));
                if ($payloadError !== null) {
                    $validator->errors()->add('qr_payload', $payloadError);
                }
            }
        });
    }
}
