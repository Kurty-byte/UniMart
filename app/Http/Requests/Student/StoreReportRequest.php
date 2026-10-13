<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasRole('student') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
            'item_id' => ['nullable', 'integer', 'exists:items,id'],
            'reported_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $itemId = $this->input('item_id');
            $reportedUserId = $this->input('reported_user_id');

            if (! $itemId && ! $reportedUserId) {
                $validator->errors()->add('report', 'You must report either a specific item or a student user.');
            }

            if ($reportedUserId && (int) $reportedUserId === (int) $this->user()?->id) {
                $validator->errors()->add('reported_user_id', 'You cannot file a report against yourself.');
            }
        });
    }
}
