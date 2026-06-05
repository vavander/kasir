<?php

declare(strict_types=1);

use App\Models\Expense;
use App\Models\Transaction;
use App\Models\User;

describe('Cashier Dashboard Access', function () {
    it('cashier can view their dashboard', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('cashier.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Cashier/Dashboard')
                ->has('summary')
                ->has('recentTransactions')
            );
    });

    it('owner cannot access cashier dashboard', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->get(route('cashier.dashboard'))->assertStatus(403);
    });

    it('guest is redirected to login', function () {
        $this->get(route('cashier.dashboard'))->assertRedirect(route('login'));
    });

    it('inactive cashier cannot access', function () {
        $cashier = User::factory()->cashier()->inactive()->create();

        $this->actingAs($cashier)->get(route('cashier.dashboard'))->assertRedirect(route('login'));
    });
});

describe('Cashier Dashboard Data', function () {
    it('summary is scoped to the logged-in cashier and today', function () {
        $cashier = User::factory()->cashier()->create();
        $other = User::factory()->cashier()->create();

        Transaction::factory()->create(['cashier_id' => $cashier->id, 'total' => 40000, 'created_at' => now()]);
        Transaction::factory()->create(['cashier_id' => $cashier->id, 'total' => 60000, 'created_at' => now()]);
        Transaction::factory()->create(['cashier_id' => $cashier->id, 'total' => 99000, 'created_at' => now()->subDay()]); // not today
        Transaction::factory()->create(['cashier_id' => $other->id, 'total' => 50000, 'created_at' => now()]); // other cashier

        Expense::factory()->create(['user_id' => $cashier->id, 'amount' => 15000, 'expense_date' => today()]);

        $this->actingAs($cashier)
            ->get(route('cashier.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('summary.transactions_today', 2)
                ->where('summary.revenue_today', 100000)
                ->where('summary.expenses_today', 15000)
            );
    });

    it('does not expose HPP or profit to cashier', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('cashier.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->missing('summary.hpp')
                ->missing('summary.laba_bersih')
            );
    });

    it('recent transactions only include own transactions', function () {
        $cashier = User::factory()->cashier()->create();
        $other = User::factory()->cashier()->create();
        Transaction::factory()->create(['cashier_id' => $cashier->id]);
        Transaction::factory()->count(3)->create(['cashier_id' => $other->id]);

        $this->actingAs($cashier)
            ->get(route('cashier.dashboard'))
            ->assertInertia(fn ($page) => $page->has('recentTransactions', 1));
    });
});
