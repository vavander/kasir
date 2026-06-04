<?php

declare(strict_types=1);

use App\Enums\ExpenseCategory;
use App\Models\Expense;
use App\Models\User;

describe('Expense Model', function () {
    it('has correct fillable fields', function () {
        $expense = new Expense();

        expect($expense->getFillable())->toContain('user_id', 'category', 'amount', 'description', 'expense_date');
    });

    it('casts category to ExpenseCategory enum', function () {
        $expense = Expense::factory()->create(['category' => ExpenseCategory::Gas->value]);

        expect($expense->category)->toBeInstanceOf(ExpenseCategory::class);
        expect($expense->category)->toBe(ExpenseCategory::Gas);
    });

    it('casts expense_date to date', function () {
        $expense = Expense::factory()->create(['expense_date' => '2026-06-04']);

        expect($expense->expense_date)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
    });

    it('belongs to a user', function () {
        $user = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $user->id]);

        expect($expense->user)->toBeInstanceOf(User::class);
        expect($expense->user->id)->toBe($user->id);
    });

    it('description is nullable', function () {
        $expense = Expense::factory()->create(['description' => null]);

        expect($expense->description)->toBeNull();
    });

    it('scope today returns only today expenses', function () {
        Expense::factory()->count(2)->create(['expense_date' => today()->toDateString()]);
        Expense::factory()->count(3)->create(['expense_date' => today()->subDay()->toDateString()]);

        $today = Expense::today()->get();

        expect($today)->toHaveCount(2);
    });

    it('scope forUser filters by user', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Expense::factory()->count(2)->create(['user_id' => $user1->id]);
        Expense::factory()->count(3)->create(['user_id' => $user2->id]);

        $results = Expense::forUser($user1->id)->get();

        expect($results)->toHaveCount(2);
    });
});
