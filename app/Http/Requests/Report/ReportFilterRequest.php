<?php

declare(strict_types=1);

namespace App\Http\Requests\Report;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReportFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mode' => ['nullable', Rule::in(['daily', 'monthly', 'custom'])],
            'date' => ['nullable', 'date'],
            'month' => ['nullable', 'date_format:Y-m'],
            'start' => ['nullable', 'date'],
            'end' => ['nullable', 'date', 'after_or_equal:start'],
        ];
    }

    public function messages(): array
    {
        return [
            'month.date_format' => 'Format bulan tidak valid.',
            'end.after_or_equal' => 'Tanggal akhir tidak boleh sebelum tanggal awal.',
        ];
    }

    /**
     * Normalised filter values used by the report service.
     */
    public function filters(): array
    {
        return [
            'mode' => $this->input('mode', 'daily'),
            'date' => $this->input('date'),
            'month' => $this->input('month'),
            'start' => $this->input('start'),
            'end' => $this->input('end'),
        ];
    }
}
