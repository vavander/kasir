<?php

declare(strict_types=1);

use App\Http\Controllers\Cashier\PosController;
use App\Http\Controllers\Owner\DashboardController;
use App\Http\Controllers\Owner\MenuController;
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
});

// Cashier routes
Route::middleware(['auth', 'active', 'cashier'])->group(function () {
    Route::get('/pos', [PosController::class, 'index'])->name('cashier.pos');
});

// Shared authenticated routes
Route::middleware(['auth', 'active'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
