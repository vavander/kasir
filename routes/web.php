<?php

declare(strict_types=1);

use App\Http\Controllers\Cashier\DashboardController as CashierDashboardController;
use App\Http\Controllers\Cashier\ExpenseController as CashierExpenseController;
use App\Http\Controllers\Cashier\PosController;
use App\Http\Controllers\Cashier\TransactionController as CashierTransactionController;
use App\Http\Controllers\Cashier\TransactionHistoryController;
use App\Http\Controllers\Owner\DashboardController;
use App\Http\Controllers\Owner\ExpenseController as OwnerExpenseController;
use App\Http\Controllers\Owner\CashierController;
use App\Http\Controllers\Owner\MenuController;
use App\Http\Controllers\Owner\ReportController;
use App\Http\Controllers\Owner\TransactionController as OwnerTransactionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// Owner routes
Route::middleware(['auth', 'active', 'owner'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('owner.dashboard');

    Route::resource('menus', MenuController::class)->names([
        'index' => 'owner.menus.index',
        'create' => 'owner.menus.create',
        'store' => 'owner.menus.store',
        'edit' => 'owner.menus.edit',
        'update' => 'owner.menus.update',
        'destroy' => 'owner.menus.destroy',
    ]);
    Route::patch('menus/{menu}/toggle-status', [MenuController::class, 'toggleStatus'])
        ->name('owner.menus.toggle-status');

    Route::get('/transactions', [OwnerTransactionController::class, 'index'])
        ->name('owner.transactions.index');
    Route::get('/transactions/{id}', [OwnerTransactionController::class, 'show'])
        ->name('owner.transactions.show');

    Route::get('/expenses', [OwnerExpenseController::class, 'index'])->name('owner.expenses.index');
    Route::post('/expenses', [OwnerExpenseController::class, 'store'])->name('owner.expenses.store');
    Route::put('/expenses/{expense}', [OwnerExpenseController::class, 'update'])->name('owner.expenses.update');
    Route::delete('/expenses/{expense}', [OwnerExpenseController::class, 'destroy'])->name('owner.expenses.destroy');

    Route::get('/reports', [ReportController::class, 'index'])->name('owner.reports.index');
    Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf'])->name('owner.reports.export.pdf');
    Route::get('/reports/export/excel', [ReportController::class, 'exportExcel'])->name('owner.reports.export.excel');

    Route::get('/cashiers', [CashierController::class, 'index'])->name('owner.cashiers.index');
    Route::get('/cashiers/create', [CashierController::class, 'create'])->name('owner.cashiers.create');
    Route::post('/cashiers', [CashierController::class, 'store'])->name('owner.cashiers.store');
    Route::get('/cashiers/{cashier}', [CashierController::class, 'show'])->name('owner.cashiers.show');
    Route::get('/cashiers/{cashier}/edit', [CashierController::class, 'edit'])->name('owner.cashiers.edit');
    Route::put('/cashiers/{cashier}', [CashierController::class, 'update'])->name('owner.cashiers.update');
    Route::patch('/cashiers/{cashier}/toggle-status', [CashierController::class, 'toggleStatus'])->name('owner.cashiers.toggle-status');
    Route::put('/cashiers/{cashier}/reset-password', [CashierController::class, 'resetPassword'])->name('owner.cashiers.reset-password');
});

// Cashier routes
Route::middleware(['auth', 'active', 'cashier'])->group(function () {
    Route::get('/cashier/dashboard', [CashierDashboardController::class, 'index'])->name('cashier.dashboard');

    Route::get('/pos', [PosController::class, 'index'])->name('cashier.pos');
    Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('cashier.pos.checkout');

    Route::get('/cashier/transactions', [TransactionHistoryController::class, 'index'])
        ->name('cashier.transactions.index');
    Route::get('/cashier/transactions/{id}', [TransactionHistoryController::class, 'show'])
        ->name('cashier.transactions.show');

    Route::get('/cashier/expenses', [CashierExpenseController::class, 'index'])->name('cashier.expenses.index');
    Route::post('/cashier/expenses', [CashierExpenseController::class, 'store'])->name('cashier.expenses.store');
    Route::put('/cashier/expenses/{expense}', [CashierExpenseController::class, 'update'])->name('cashier.expenses.update');
    Route::delete('/cashier/expenses/{expense}', [CashierExpenseController::class, 'destroy'])->name('cashier.expenses.destroy');
});

// Shared authenticated routes (owner + cashier)
Route::middleware(['auth', 'active'])->group(function () {
    Route::get('/transactions/{transaction}/receipt', [CashierTransactionController::class, 'receipt'])
        ->name('transactions.receipt');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
