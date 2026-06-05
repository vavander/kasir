<?php

declare(strict_types=1);

use App\Models\Menu;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;

describe('Owner Transaction History', function () {
    it('owner can view all transactions', function () {
        $owner = User::factory()->owner()->create();
        $cashier1 = User::factory()->cashier()->create();
        $cashier2 = User::factory()->cashier()->create();

        Transaction::factory()->count(3)->create(['cashier_id' => $cashier1->id]);
        Transaction::factory()->count(4)->create(['cashier_id' => $cashier2->id]);

        $this->actingAs($owner)
            ->get(route('owner.transactions.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Transaction/Index')
                ->has('transactions.data', 7)
            );
    });

    it('owner can view any transaction detail', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier->id]);

        $this->actingAs($owner)
            ->get(route('owner.transactions.show', $transaction->id))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Transaction/Show')
                ->where('transaction.invoice_number', $transaction->invoice_number)
            );
    });

    it('owner transaction detail includes hpp data', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['hpp' => 10000, 'selling_price' => 18000]);
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier->id]);

        TransactionItem::factory()->create([
            'transaction_id' => $transaction->id,
            'menu_id' => $menu->id,
            'menu_name' => $menu->name,
            'qty' => 1,
            'hpp' => 10000,
            'selling_price' => 18000,
            'subtotal' => 18000,
        ]);

        $this->actingAs($owner)
            ->get(route('owner.transactions.show', $transaction->id))
            ->assertInertia(fn ($page) => $page
                ->has('transaction.items.0.hpp')
                ->where('transaction.items.0.hpp', 10000)
            );
    });

    it('owner can search transactions by invoice', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();

        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'invoice_number' => 'INV-20260604-0001',
        ]);
        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'invoice_number' => 'INV-20260604-0002',
        ]);

        $this->actingAs($owner)
            ->get(route('owner.transactions.index', ['search' => '0002']))
            ->assertInertia(fn ($page) => $page
                ->has('transactions.data', 1)
            );
    });

    it('cashier cannot access owner transaction routes', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('owner.transactions.index'))
            ->assertStatus(403);
    });

    it('transactions cannot be deleted — no delete route exists', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier->id]);

        // Route exists but no DELETE method → 405 Method Not Allowed
        $this->actingAs($owner)
            ->delete('/transactions/'.$transaction->id)
            ->assertStatus(405);

        $this->assertDatabaseHas('transactions', ['id' => $transaction->id]);
    });
});
