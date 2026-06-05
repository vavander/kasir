<?php

declare(strict_types=1);

use App\Models\Expense;
use App\Models\User;

describe('Owner Expense Page Access', function () {
    it('owner can view expense index', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.expenses.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Expense/Index')
                ->has('expenses')
                ->has('summary')
                ->has('filters')
            );
    });

    it('cashier cannot access owner expenses', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('owner.expenses.index'))
            ->assertStatus(403);
    });

    it('guest is redirected to login', function () {
        $this->get(route('owner.expenses.index'))->assertRedirect(route('login'));
    });
});

describe('Owner Create Expense', function () {
    it('owner can record an expense', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.expenses.store'), [
            'category' => 'Gas',
            'amount' => 25000,
            'description' => 'Isi ulang gas',
            'expense_date' => today()->toDateString(),
        ])->assertRedirect();

        $this->assertDatabaseHas('expenses', [
            'user_id' => $owner->id,
            'category' => 'Gas',
            'amount' => 25000,
        ]);
    });

    it('category is required', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.expenses.store'), [
            'amount' => 25000,
            'expense_date' => today()->toDateString(),
        ])->assertSessionHasErrors('category');
    });

    it('category must be a valid option', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.expenses.store'), [
            'category' => 'Tidak Valid',
            'amount' => 25000,
            'expense_date' => today()->toDateString(),
        ])->assertSessionHasErrors('category');
    });

    it('amount must be at least 1', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.expenses.store'), [
            'category' => 'Listrik',
            'amount' => 0,
            'expense_date' => today()->toDateString(),
        ])->assertSessionHasErrors('amount');
    });

    it('expense date cannot be in the future', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.expenses.store'), [
            'category' => 'Listrik',
            'amount' => 50000,
            'expense_date' => today()->addDay()->toDateString(),
        ])->assertSessionHasErrors('expense_date');
    });
});

describe('Owner Update & Delete Expense', function () {
    it('owner can update own expense', function () {
        $owner = User::factory()->owner()->create();
        $expense = Expense::factory()->create([
            'user_id' => $owner->id,
            'category' => 'Gas',
            'amount' => 10000,
        ]);

        $this->actingAs($owner)->put(route('owner.expenses.update', $expense), [
            'category' => 'Transport',
            'amount' => 30000,
            'expense_date' => today()->toDateString(),
        ])->assertRedirect();

        expect($expense->fresh()->category->value)->toBe('Transport');
        expect((float) $expense->fresh()->amount)->toBe(30000.0);
    });

    it('owner can delete own expense', function () {
        $owner = User::factory()->owner()->create();
        $expense = Expense::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner)
            ->delete(route('owner.expenses.destroy', $expense))
            ->assertRedirect();

        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    });

    it('owner cannot delete another user expense', function () {
        $owner = User::factory()->owner()->create();
        $other = User::factory()->cashier()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);

        $this->actingAs($owner)
            ->delete(route('owner.expenses.destroy', $expense))
            ->assertStatus(403);

        $this->assertDatabaseHas('expenses', ['id' => $expense->id]);
    });
});

describe('Owner Expense Search & Summary', function () {
    it('search filters expenses by category', function () {
        $owner = User::factory()->owner()->create();
        Expense::factory()->create(['user_id' => $owner->id, 'category' => 'Gas']);
        Expense::factory()->create(['user_id' => $owner->id, 'category' => 'Listrik']);
        Expense::factory()->create(['user_id' => $owner->id, 'category' => 'Listrik']);

        $this->actingAs($owner)
            ->get(route('owner.expenses.index', ['search' => 'Listrik']))
            ->assertInertia(fn ($page) => $page->has('expenses.data', 2));
    });

    it('owner sees expenses from all users', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();
        Expense::factory()->create(['user_id' => $owner->id]);
        Expense::factory()->create(['user_id' => $cashier->id]);

        $this->actingAs($owner)
            ->get(route('owner.expenses.index'))
            ->assertInertia(fn ($page) => $page->has('expenses.data', 2));
    });

    it('summary totals only today expenses', function () {
        $owner = User::factory()->owner()->create();
        Expense::factory()->create(['user_id' => $owner->id, 'amount' => 15000, 'expense_date' => today()->toDateString()]);
        Expense::factory()->create(['user_id' => $owner->id, 'amount' => 99000, 'expense_date' => today()->subMonths(2)->toDateString()]);

        $this->actingAs($owner)
            ->get(route('owner.expenses.index'))
            ->assertInertia(fn ($page) => $page->where('summary.today', 15000));
    });
});
