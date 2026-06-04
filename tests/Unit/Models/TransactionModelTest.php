<?php

declare(strict_types=1);

use App\Enums\PaymentMethod;
use App\Models\Transaction;
use App\Models\User;

describe('Transaction Model', function () {
    it('has correct fillable fields', function () {
        $transaction = new Transaction();

        expect($transaction->getFillable())->toContain('invoice_number', 'cashier_id', 'payment_method', 'subtotal', 'total');
    });

    it('casts payment_method to PaymentMethod enum', function () {
        $transaction = Transaction::factory()->cash()->create();

        expect($transaction->payment_method)->toBeInstanceOf(PaymentMethod::class);
        expect($transaction->payment_method)->toBe(PaymentMethod::Cash);
    });

    it('belongs to a cashier (User)', function () {
        $cashier = User::factory()->cashier()->create();
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier->id]);

        expect($transaction->cashier)->toBeInstanceOf(User::class);
        expect($transaction->cashier->id)->toBe($cashier->id);
    });

    it('has items relationship', function () {
        $transaction = Transaction::factory()->create();

        expect($transaction->items())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
    });

    it('invoice_number must be unique', function () {
        Transaction::factory()->create(['invoice_number' => 'INV-20260604-0001']);

        expect(fn () => Transaction::factory()->create(['invoice_number' => 'INV-20260604-0001']))
            ->toThrow(\Illuminate\Database\QueryException::class);
    });

    it('scope today returns only today transactions', function () {
        Transaction::factory()->count(3)->create(['created_at' => now()]);
        Transaction::factory()->count(2)->create(['created_at' => now()->subDay()]);

        $today = Transaction::today()->get();

        expect($today)->toHaveCount(3);
    });

    it('scope forCashier filters by cashier', function () {
        $cashier1 = User::factory()->cashier()->create();
        $cashier2 = User::factory()->cashier()->create();

        Transaction::factory()->count(2)->create(['cashier_id' => $cashier1->id]);
        Transaction::factory()->count(3)->create(['cashier_id' => $cashier2->id]);

        $results = Transaction::forCashier($cashier1->id)->get();

        expect($results)->toHaveCount(2);
    });
});
