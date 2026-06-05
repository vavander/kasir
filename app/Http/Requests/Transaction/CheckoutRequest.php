<?php

declare(strict_types=1);

namespace App\Http\Requests\Transaction;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
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
            'customer_name' => ['required', 'string', 'min:2', 'max:100'],
            'payment_status' => ['required', new Enum(PaymentStatus::class)],
            'payment_method' => ['required_if:payment_status,paid', 'nullable', new Enum(PaymentMethod::class)],
            'paid_amount' => ['required_if:payment_status,paid', 'nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Keranjang tidak boleh kosong.',
            'items.min' => 'Minimal satu item di keranjang.',
            'items.*.menu_id.exists' => 'Menu tidak ditemukan.',
            'items.*.qty.min' => 'Qty minimal 1.',
            'customer_name.required' => 'Nama pelanggan wajib diisi.',
            'customer_name.min' => 'Nama pelanggan minimal 2 karakter.',
            'customer_name.max' => 'Nama pelanggan maksimal 100 karakter.',
            'payment_method.required_if' => 'Pilih metode pembayaran.',
            'paid_amount.required_if' => 'Nominal bayar wajib diisi.',
            'paid_amount.min' => 'Nominal bayar tidak valid.',
        ];
    }

    public function isPaidNow(): bool
    {
        return $this->input('payment_status') === PaymentStatus::Paid->value;
    }

    public function getPaymentMethod(): ?PaymentMethod
    {
        $value = $this->input('payment_method');

        return $value ? PaymentMethod::from($value) : null;
    }
}
