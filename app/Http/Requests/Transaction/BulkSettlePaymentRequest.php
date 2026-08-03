<?php

declare(strict_types=1);

namespace App\Http\Requests\Transaction;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class BulkSettlePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_ids' => ['required', 'array', 'min:1'],
            'transaction_ids.*' => ['integer', 'exists:transactions,id'],
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
            'paid_amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_ids.required' => 'Pilih minimal satu pesanan.',
            'transaction_ids.min' => 'Pilih minimal satu pesanan.',
            'payment_method.required' => 'Pilih metode pembayaran.',
            'paid_amount.required' => 'Nominal bayar wajib diisi.',
        ];
    }

    public function getPaymentMethod(): PaymentMethod
    {
        return PaymentMethod::from($this->string('payment_method')->value());
    }

    /**
     * @return array<int, int>
     */
    public function getTransactionIds(): array
    {
        return array_map('intval', $this->validated('transaction_ids'));
    }
}
