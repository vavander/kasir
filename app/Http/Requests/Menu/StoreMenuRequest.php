<?php

declare(strict_types=1);

namespace App\Http\Requests\Menu;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:menus,name'],
            'category' => ['nullable', 'string', 'max:50'],
            'hpp' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama menu wajib diisi.',
            'name.unique' => 'Nama menu sudah digunakan.',
            'name.max' => 'Nama menu maksimal 100 karakter.',
            'hpp.required' => 'HPP wajib diisi.',
            'hpp.min' => 'HPP tidak boleh negatif.',
            'selling_price.required' => 'Harga jual wajib diisi.',
            'selling_price.min' => 'Harga jual tidak boleh negatif.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format gambar harus jpg, jpeg, png, atau webp.',
            'image.max' => 'Ukuran gambar maksimal 5 MB.',
        ];
    }
}
