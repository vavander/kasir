<?php

declare(strict_types=1);

namespace App\Http\Requests\Transaction;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCashier();
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'exists:menus,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
            'paid_amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Keranjang tidak boleh kosong.',
            'items.min' => 'Minimal satu item di keranjang.',
            'items.*.menu_id.exists' => 'Menu tidak ditemukan.',
            'items.*.qty.min' => 'Qty minimal 1.',
            'payment_method.required' => 'Pilih metode pembayaran.',
            'paid_amount.min' => 'Nominal bayar tidak valid.',
        ];
    }

    public function getPaymentMethod(): PaymentMethod
    {
        return PaymentMethod::from($this->string('payment_method')->value());
    }
}
