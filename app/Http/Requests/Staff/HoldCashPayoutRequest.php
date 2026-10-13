<?php

namespace App\Http\Requests\Staff;

use App\Enums\PayoutHoldReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HoldCashPayoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $orderItem = $this->route('orderItem');

        return $this->user()?->can('holdPayout', $orderItem) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'reason' => ['nullable', Rule::enum(PayoutHoldReason::class)],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
