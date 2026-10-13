<?php

namespace App\Http\Requests\Admin;

use App\Enums\SettingKey;
use App\Models\Setting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', Setting::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            SettingKey::CartSoftHoldMinutes->value => SettingKey::CartSoftHoldMinutes->rules(),
            SettingKey::OrderHardHoldHours->value => SettingKey::OrderHardHoldHours->rules(),
            SettingKey::ItemShelfExpiryDays->value => SettingKey::ItemShelfExpiryDays->rules(),
        ];
    }
}
