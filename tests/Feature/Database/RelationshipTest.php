<?php

declare(strict_types=1);

use App\Models\Expense;
use App\Models\Menu;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;

describe('Model Relationships', function () {
    it('user has many transactions', function () {
        $cashier = User::factory()->cashier()->create();
        Transaction::factory()->count(3)->create(['cashier_id' => $cashier->id]);

        expect($cashier->transactions)->toHaveCount(3);
        expect($cashier->transactions->first())->toBeInstanceOf(Transaction::class);
    });

    it('user has many expenses', function () {
        $user = User::factory()->create();
        Expense::factory()->count(2)->create(['user_id' => $user->id]);

        expect($user->expenses)->toHaveCount(2);
        expect($user->expenses->first())->toBeInstanceOf(Expense::class);
    });

    it('transaction belongs to cashier', function () {
        $cashier = User::factory()->cashier()->create();
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier->id]);

        expect($transaction->cashier)->toBeInstanceOf(User::class);
        expect($transaction->cashier->id)->toBe($cashier->id);
    });

    it('transaction has many items', function () {
        $transaction = Transaction::factory()->create();
        $menu = Menu::factory()->create();

        TransactionItem::factory()->count(2)->create([
            'transaction_id' => $transaction->id,
            'menu_id' => $menu->id,
            'menu_name' => $menu->name,
            'qty' => 1,
            'hpp' => $menu->hpp,
            'selling_price' => $menu->selling_price,
            'subtotal' => $menu->selling_price,
        ]);

        expect($transaction->items)->toHaveCount(2);
        expect($transaction->items->first())->toBeInstanceOf(TransactionItem::class);
    });

    it('transaction_item belongs to transaction', function () {
        $transaction = Transaction::factory()->create();
        $menu = Menu::factory()->create();

        $item = TransactionItem::factory()->create([
            'transaction_id' => $transaction->id,
            'menu_id' => $menu->id,
            'menu_name' => $menu->name,
            'qty' => 1,
            'hpp' => $menu->hpp,
            'selling_price' => $menu->selling_price,
            'subtotal' => $menu->selling_price,
        ]);

        expect($item->transaction)->toBeInstanceOf(Transaction::class);
        expect($item->transaction->id)->toBe($transaction->id);
    });

    it('transaction_item belongs to menu', function () {
        $transaction = Transaction::factory()->create();
        $menu = Menu::factory()->create();

        $item = TransactionItem::factory()->create([
            'transaction_id' => $transaction->id,
            'menu_id' => $menu->id,
            'menu_name' => $menu->name,
            'qty' => 1,
            'hpp' => $menu->hpp,
            'selling_price' => $menu->selling_price,
            'subtotal' => $menu->selling_price,
        ]);

        expect($item->menu)->toBeInstanceOf(Menu::class);
        expect($item->menu->id)->toBe($menu->id);
    });

    it('menu has many transaction_items', function () {
        $menu = Menu::factory()->create();
        $transaction = Transaction::factory()->create();

        TransactionItem::factory()->count(3)->create([
            'transaction_id' => $transaction->id,
            'menu_id' => $menu->id,
            'menu_name' => $menu->name,
            'qty' => 2,
            'hpp' => $menu->hpp,
            'selling_price' => $menu->selling_price,
            'subtotal' => (float) $menu->selling_price * 2,
        ]);

        expect($menu->transactionItems)->toHaveCount(3);
    });

    it('expense belongs to user', function () {
        $user = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $user->id]);

        expect($expense->user)->toBeInstanceOf(User::class);
        expect($expense->user->id)->toBe($user->id);
    });
});
