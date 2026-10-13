<?php

namespace App\Http\Requests\Settings;

use App\Support\EmvcoQrValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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
            'ewallet_qr' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'ewallet_provider' => ['nullable', 'string', 'max:50'],
            'ewallet_account_name' => ['nullable', 'string', 'max:100'],
            'ewallet_account_number' => ['nullable', 'string', 'max:50'],
            'qr_payload' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $user = $this->user();
            $hasExisting = $user && ($user->hasEwalletQr() || ! empty($user->ewallet_account_number));
            $hasNewQr = $this->hasFile('ewallet_qr');
            $hasNewAccount = $this->filled('ewallet_account_number');

            if (! $hasExisting && ! $hasNewQr && ! $hasNewAccount) {
                $validator->errors()->add('ewallet_qr', 'Please upload an e-wallet QR code or provide your account number.');
            }

            if ($this->filled('qr_payload')) {
                $payloadError = EmvcoQrValidator::validate((string) $this->input('qr_payload'));
                if ($payloadError !== null) {
                    $validator->errors()->add('qr_payload', $payloadError);
                }
            }
        });
    }
}
