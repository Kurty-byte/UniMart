<?php

namespace App\Http\Requests\Admin;

use App\Models\Report;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ResolveReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $report = $this->route('report');

        return $report instanceof Report
            ? ($this->user()?->can('resolve', $report) ?? false)
            : ($this->user()?->can('resolve', Report::class) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:resolved,dismissed'],
            'resolution_notes' => ['required', 'string', 'max:2000'],
        ];
    }
}
