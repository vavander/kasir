<?php

declare(strict_types=1);

use App\Enums\ExpenseCategory;
use App\Enums\PaymentMethod;
use App\Models\Expense;
use App\Models\Menu;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Services\DashboardService;

describe('Dashboard Access', function () {
    it('owner can access dashboard page', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Dashboard')
                ->has('summary')
                ->has('salesChart')
                ->has('expenseChart')
                ->has('topMenus')
                ->has('recentTransactions')
                ->has('recentExpenses')
            );
    });

    it('cashier cannot access dashboard', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('owner.dashboard'))
            ->assertStatus(403);
    });

    it('guest is redirected to login', function () {
        $this->get(route('owner.dashboard'))
            ->assertRedirect(route('login'));
    });
});

describe('DashboardService — Today Summary', function () {
    it('returns zero summary when no data', function () {
        $service = app(DashboardService::class);
        $summary = $service->getTodaySummary();

        expect($summary['omzet'])->toBe(0.0);
        expect($summary['hpp'])->toBe(0.0);
        expect($summary['pengeluaran'])->toBe(0.0);
        expect($summary['laba_bersih'])->toBe(0.0);
    });

    it('calculates omzet correctly from today transactions', function () {
        $cashier = User::factory()->cashier()->create();

        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'total' => 50000,
            'subtotal' => 50000,
            'created_at' => now(),
        ]);
        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'total' => 30000,
            'subtotal' => 30000,
            'created_at' => now(),
        ]);
        // Yesterday — should NOT be counted
        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'total' => 100000,
            'subtotal' => 100000,
            'created_at' => now()->subDay(),
        ]);

        $service = app(DashboardService::class);
        $summary = $service->getTodaySummary();

        expect($summary['omzet'])->toBe(80000.0);
    });

    it('calculates hpp correctly from today transaction items', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['hpp' => 10000, 'selling_price' => 18000]);

        $transaction = Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'created_at' => now(),
        ]);

        TransactionItem::factory()->create([
            'transaction_id' => $transaction->id,
            'menu_id' => $menu->id,
            'menu_name' => $menu->name,
            'qty' => 3,
            'hpp' => 10000,
            'selling_price' => 18000,
            'subtotal' => 54000,
        ]);

        $service = app(DashboardService::class);
        $summary = $service->getTodaySummary();

        expect($summary['hpp'])->toBe(30000.0); // 10000 × 3
    });

    it('calculates pengeluaran correctly from today expenses', function () {
        $user = User::factory()->create();

        Expense::factory()->create([
            'user_id' => $user->id,
            'amount' => 25000,
            'expense_date' => today(),
        ]);
        Expense::factory()->create([
            'user_id' => $user->id,
            'amount' => 15000,
            'expense_date' => today(),
        ]);
        // Yesterday — should NOT be counted
        Expense::factory()->create([
            'user_id' => $user->id,
            'amount' => 50000,
            'expense_date' => today()->subDay(),
        ]);

        $service = app(DashboardService::class);
        $summary = $service->getTodaySummary();

        expect($summary['pengeluaran'])->toBe(40000.0);
    });

    it('calculates laba bersih as omzet minus hpp minus pengeluaran', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['hpp' => 10000, 'selling_price' => 18000]);

        $transaction = Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'total' => 18000,
            'subtotal' => 18000,
            'created_at' => now(),
        ]);
        TransactionItem::factory()->create([
            'transaction_id' => $transaction->id,
            'menu_id' => $menu->id,
            'menu_name' => $menu->name,
            'qty' => 1,
            'hpp' => 10000,
            'selling_price' => 18000,
            'subtotal' => 18000,
        ]);
        Expense::factory()->create([
            'user_id' => $cashier->id,
            'amount' => 3000,
            'expense_date' => today(),
        ]);

        $service = app(DashboardService::class);
        $summary = $service->getTodaySummary();

        // Omzet=18000, HPP=10000, Pengeluaran=3000, Laba=5000
        expect($summary['omzet'])->toBe(18000.0);
        expect($summary['hpp'])->toBe(10000.0);
        expect($summary['pengeluaran'])->toBe(3000.0);
        expect($summary['laba_bersih'])->toBe(5000.0);
    });

    it('laba bersih can be negative', function () {
        $cashier = User::factory()->cashier()->create();

        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'total' => 10000,
            'created_at' => now(),
        ]);
        Expense::factory()->create([
            'user_id' => $cashier->id,
            'amount' => 50000,
            'expense_date' => today(),
        ]);

        $service = app(DashboardService::class);
        $summary = $service->getTodaySummary();

        expect($summary['laba_bersih'])->toBeLessThan(0);
    });
});

describe('DashboardService — Chart Data', function () {
    it('sales chart returns 7 data points', function () {
        $service = app(DashboardService::class);
        $data = $service->getSalesChartData(7);

        expect($data)->toHaveCount(7);
        expect($data[0])->toHaveKeys(['date', 'total']);
    });

    it('expense chart returns 7 data points', function () {
        $service = app(DashboardService::class);
        $data = $service->getExpenseChartData(7);

        expect($data)->toHaveCount(7);
        expect($data[0])->toHaveKeys(['date', 'total']);
    });

    it('sales chart totals match actual transactions', function () {
        $cashier = User::factory()->cashier()->create();

        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'total' => 100000,
            'created_at' => now(),
        ]);
        Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'total' => 50000,
            'created_at' => now(),
        ]);

        $service = app(DashboardService::class);
        $data = $service->getSalesChartData(7);

        $todayEntry = last($data);
        expect($todayEntry['total'])->toBe(150000.0);
    });
});

describe('DashboardService — Top Menus', function () {
    it('returns top menus ordered by qty sold', function () {
        $cashier = User::factory()->cashier()->create();
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier->id]);

        TransactionItem::factory()->create([
            'transaction_id' => $transaction->id,
            'menu_id' => Menu::factory()->create()->id,
            'menu_name' => 'Nasi Goreng',
            'qty' => 10,
            'hpp' => 5000, 'selling_price' => 10000, 'subtotal' => 100000,
        ]);
        TransactionItem::factory()->create([
            'transaction_id' => $transaction->id,
            'menu_id' => Menu::factory()->create()->id,
            'menu_name' => 'Mie Ayam',
            'qty' => 5,
            'hpp' => 4000, 'selling_price' => 8000, 'subtotal' => 40000,
        ]);

        $service = app(DashboardService::class);
        $menus = $service->getTopMenus(5);

        expect($menus[0]['menu_name'])->toBe('Nasi Goreng');
        expect($menus[0]['total_qty'])->toBe(10);
        expect($menus[1]['menu_name'])->toBe('Mie Ayam');
    });

    it('returns at most the requested limit', function () {
        $cashier = User::factory()->cashier()->create();
        $transaction = Transaction::factory()->create(['cashier_id' => $cashier->id]);

        for ($i = 1; $i <= 8; $i++) {
            TransactionItem::factory()->create([
                'transaction_id' => $transaction->id,
                'menu_id' => Menu::factory()->create()->id,
                'menu_name' => "Menu {$i}",
                'qty' => $i,
                'hpp' => 5000, 'selling_price' => 10000, 'subtotal' => 10000 * $i,
            ]);
        }

        $service = app(DashboardService::class);
        $menus = $service->getTopMenus(5);

        expect($menus)->toHaveCount(5);
    });
});

describe('DashboardService — Recent Activity', function () {
    it('returns recent transactions with cashier name', function () {
        $cashier = User::factory()->cashier()->create(['name' => 'Budi Kasir']);
        Transaction::factory()->create(['cashier_id' => $cashier->id]);

        $service = app(DashboardService::class);
        $transactions = $service->getRecentTransactions(5);

        expect($transactions[0])->toHaveKeys(['id', 'invoice_number', 'cashier_name', 'payment_method', 'total', 'created_at']);
        expect($transactions[0]['cashier_name'])->toBe('Budi Kasir');
    });

    it('returns recent expenses with user name', function () {
        $user = User::factory()->create(['name' => 'Siti Owner']);
        Expense::factory()->create(['user_id' => $user->id]);

        $service = app(DashboardService::class);
        $expenses = $service->getRecentExpenses(5);

        expect($expenses[0])->toHaveKeys(['id', 'category', 'amount', 'created_by', 'expense_date']);
        expect($expenses[0]['created_by'])->toBe('Siti Owner');
    });
});
