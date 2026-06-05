<?php

declare(strict_types=1);

use App\Models\Menu;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;

describe('Cashier Transaction History', function () {
    it('cashier can view their own transaction list', function () {
        $cashier = User::factory()->cashier()->create();
        Transaction::factory()->count(3)->create(['cashier_id' => $cashier->id]);

        $this->actingAs($cashier)
            ->get(route('cashier.transactions.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Cashier/Transaction/Index')
                ->has('transactions')
                ->has('filters')
            );
    });

    it('cashier only sees their own transactions', function () {
        $cashier1 = User::factory()->cashier()->create();
        $cashier2 = User::factory()->cashier()->create();

        Transaction::factory()->count(3)->create(['cashier_id' => $cashier1->id]);
        Transaction::factory()->count(5)->create(['cashier_id' => $cashier2->id]);

        $this->actingAs($cashier1)
            ->get(route('cashier.transactions.index'))
            ->assertInertia(fn ($page) => $page
                ->has('transactions.data', 3)
            );
    });

    it('cashier can view their own transaction detail', function () {
        $cashier = User::factory()->cashier()->create();
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier->id]);

        $this->actingAs($cashier)
            ->get(route('cashier.transactions.show', $transaction->id))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Cashier/Transaction/Show')
                ->has('transaction')
                ->where('transaction.invoice_number', $transaction->invoice_number)
            );
    });

    it('cashier cannot view another cashier transaction detail', function () {
        $cashier1 = User::factory()->cashier()->create();
        $cashier2 = User::factory()->cashier()->create();
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier2->id]);

        $this->actingAs($cashier1)
            ->get(route('cashier.transactions.show', $transaction->id))
            ->assertStatus(404);
    });

    it('cashier can search transactions by invoice', function () {
        $cashier = User::factory()->cashier()->create();
        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'invoice_number' => 'INV-20260604-0001',
        ]);
        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'invoice_number' => 'INV-20260604-0002',
        ]);

        $this->actingAs($cashier)
            ->get(route('cashier.transactions.index', ['search' => '0001']))
            ->assertInertia(fn ($page) => $page
                ->has('transactions.data', 1)
            );
    });

    it('transaction detail includes items', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create();
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier->id]);

        TransactionItem::factory()->create([
            'transaction_id' => $transaction->id,
            'menu_id' => $menu->id,
            'menu_name' => 'Nasi Goreng',
            'qty' => 2,
            'hpp' => 10000,
            'selling_price' => 18000,
            'subtotal' => 36000,
        ]);

        $this->actingAs($cashier)
            ->get(route('cashier.transactions.show', $transaction->id))
            ->assertInertia(fn ($page) => $page
                ->has('transaction.items', 1)
                ->where('transaction.items.0.menu_name', 'Nasi Goreng')
                ->where('transaction.items.0.qty', 2)
            );
    });

    it('owner cannot access cashier transaction routes', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('cashier.transactions.index'))
            ->assertStatus(403);
    });
});
