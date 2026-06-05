<?php

declare(strict_types=1);

namespace App\Http\Requests\Expense;

use App\Enums\ExpenseCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $expense = $this->route('expense');

        return $expense && $expense->user_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', new Enum(ExpenseCategory::class)],
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['nullable', 'string', 'max:255'],
            'expense_date' => ['required', 'date', 'before_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'category.required' => 'Pilih kategori pengeluaran.',
            'amount.required' => 'Nominal wajib diisi.',
            'amount.min' => 'Nominal minimal Rp 1.',
            'expense_date.required' => 'Tanggal wajib diisi.',
            'expense_date.before_or_equal' => 'Tanggal tidak boleh di masa depan.',
        ];
    }
}
