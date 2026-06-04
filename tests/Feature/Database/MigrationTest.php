<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schema;

describe('Database Migrations', function () {
    it('users table has required columns', function () {
        expect(Schema::hasColumns('users', [
            'id', 'name', 'email', 'password', 'role', 'status', 'last_login_at', 'created_at', 'updated_at',
        ]))->toBeTrue();
    });

    it('menus table has required columns', function () {
        expect(Schema::hasColumns('menus', [
            'id', 'name', 'hpp', 'selling_price', 'image', 'is_active', 'created_at', 'updated_at',
        ]))->toBeTrue();
    });

    it('transactions table has required columns', function () {
        expect(Schema::hasColumns('transactions', [
            'id', 'invoice_number', 'cashier_id', 'payment_method', 'subtotal', 'total', 'created_at', 'updated_at',
        ]))->toBeTrue();
    });

    it('transaction_items table has required columns', function () {
        expect(Schema::hasColumns('transaction_items', [
            'id', 'transaction_id', 'menu_id', 'menu_name', 'qty', 'hpp', 'selling_price', 'subtotal', 'created_at', 'updated_at',
        ]))->toBeTrue();
    });

    it('expenses table has required columns', function () {
        expect(Schema::hasColumns('expenses', [
            'id', 'user_id', 'category', 'amount', 'description', 'expense_date', 'created_at', 'updated_at',
        ]))->toBeTrue();
    });

    it('settings table has required columns', function () {
        expect(Schema::hasColumns('settings', [
            'id', 'store_name', 'logo', 'address', 'phone', 'created_at', 'updated_at',
        ]))->toBeTrue();
    });

    it('all required tables exist', function () {
        $tables = ['users', 'menus', 'transactions', 'transaction_items', 'expenses', 'settings'];

        foreach ($tables as $table) {
            expect(Schema::hasTable($table))->toBeTrue("Table '{$table}' does not exist");
        }
    });
});
