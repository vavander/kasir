<?php

declare(strict_types=1);

use App\Models\Expense;
use App\Models\User;

describe('Cashier Expense Page Access', function () {
    it('cashier can view expense index', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('cashier.expenses.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Cashier/Expense/Index')
                ->has('expenses')
                ->has('filters')
            );
    });

    it('owner cannot access cashier expenses', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('cashier.expenses.index'))
            ->assertStatus(403);
    });

    it('cashier index does not expose owner summary', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('cashier.expenses.index'))
            ->assertInertia(fn ($page) => $page->missing('summary'));
    });

    it('guest is redirected to login', function () {
        $this->get(route('cashier.expenses.index'))->assertRedirect(route('login'));
    });
});

describe('Cashier Create Expense', function () {
    it('cashier can record an expense', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)->post(route('cashier.expenses.store'), [
            'category' => 'Bahan Baku',
            'amount' => 75000,
            'description' => 'Beli ayam',
            'expense_date' => today()->toDateString(),
        ])->assertRedirect();

        $this->assertDatabaseHas('expenses', [
            'user_id' => $cashier->id,
            'category' => 'Bahan Baku',
            'amount' => 75000,
        ]);
    });

    it('validates required fields', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)->post(route('cashier.expenses.store'), [])
            ->assertSessionHasErrors(['category', 'amount', 'expense_date']);
    });
});

describe('Cashier Update & Delete Expense', function () {
    it('cashier can update own expense', function () {
        $cashier = User::factory()->cashier()->create();
        $expense = Expense::factory()->create(['user_id' => $cashier->id, 'amount' => 10000]);

        $this->actingAs($cashier)->put(route('cashier.expenses.update', $expense), [
            'category' => 'Transport',
            'amount' => 20000,
            'expense_date' => today()->toDateString(),
        ])->assertRedirect();

        expect((float) $expense->fresh()->amount)->toBe(20000.0);
    });

    it('cashier cannot update another user expense', function () {
        $cashier = User::factory()->cashier()->create();
        $other = User::factory()->cashier()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id, 'category' => 'Gas']);

        $this->actingAs($cashier)->put(route('cashier.expenses.update', $expense), [
            'category' => 'Transport',
            'amount' => 20000,
            'expense_date' => today()->toDateString(),
        ])->assertStatus(403);

        expect($expense->fresh()->category->value)->toBe('Gas');
    });

    it('cashier can delete own expense', function () {
        $cashier = User::factory()->cashier()->create();
        $expense = Expense::factory()->create(['user_id' => $cashier->id]);

        $this->actingAs($cashier)
            ->delete(route('cashier.expenses.destroy', $expense))
            ->assertRedirect();

        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    });

    it('cashier cannot delete another user expense', function () {
        $cashier = User::factory()->cashier()->create();
        $other = User::factory()->cashier()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);

        $this->actingAs($cashier)
            ->delete(route('cashier.expenses.destroy', $expense))
            ->assertStatus(403);

        $this->assertDatabaseHas('expenses', ['id' => $expense->id]);
    });
});

describe('Cashier Expense Scoping', function () {
    it('cashier only sees own expenses', function () {
        $cashier = User::factory()->cashier()->create();
        $other = User::factory()->cashier()->create();
        Expense::factory()->count(2)->create(['user_id' => $cashier->id]);
        Expense::factory()->count(3)->create(['user_id' => $other->id]);

        $this->actingAs($cashier)
            ->get(route('cashier.expenses.index'))
            ->assertInertia(fn ($page) => $page->has('expenses.data', 2));
    });

    it('search filters cashier expenses by category', function () {
        $cashier = User::factory()->cashier()->create();
        Expense::factory()->create(['user_id' => $cashier->id, 'category' => 'Gas']);
        Expense::factory()->create(['user_id' => $cashier->id, 'category' => 'Transport']);

        $this->actingAs($cashier)
            ->get(route('cashier.expenses.index', ['search' => 'Transport']))
            ->assertInertia(fn ($page) => $page->has('expenses.data', 1));
    });
});
