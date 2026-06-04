<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        $total = fake()->numberBetween(10000, 500000);

        return [
            'invoice_number' => 'INV-'.now()->format('Ymd').'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'cashier_id' => User::factory()->cashier(),
            'payment_method' => fake()->randomElement(PaymentMethod::cases())->value,
            'subtotal' => $total,
            'total' => $total,
        ];
    }

    public function cash(): static
    {
        return $this->state(fn () => [
            'payment_method' => PaymentMethod::Cash->value,
        ]);
    }

    public function qris(): static
    {
        return $this->state(fn () => [
            'payment_method' => PaymentMethod::Qris->value,
        ]);
    }
}
