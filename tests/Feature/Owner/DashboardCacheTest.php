<?php

declare(strict_types=1);

use App\Enums\PaymentMethod;
use App\Models\Menu;
use App\Models\User;
use App\Services\DashboardService;
use App\Services\ExpenseService;
use App\Services\TransactionService;
use Illuminate\Support\Facades\Cache;

afterEach(fn () => Cache::flush());

describe('Dashboard caching', function () {
    it('populates the dashboard cache on request', function () {
        $owner = User::factory()->owner()->create();

        Cache::forget(DashboardService::cacheKey());

        $this->actingAs($owner)->get(route('owner.dashboard'))->assertSuccessful();

        expect(Cache::has(DashboardService::cacheKey()))->toBeTrue();
    });

    it('invalidates the cache when an expense is created', function () {
        Cache::put(DashboardService::cacheKey(), ['stale' => true], 60);

        $user = User::factory()->create();
        app(ExpenseService::class)->create($user, [
            'category' => 'Gas',
            'amount' => 10000,
            'expense_date' => today()->toDateString(),
        ]);

        expect(Cache::has(DashboardService::cacheKey()))->toBeFalse();
    });

    it('invalidates the cache after a checkout', function () {
        Cache::put(DashboardService::cacheKey(), ['stale' => true], 60);

        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 10000]);

        app(TransactionService::class)->checkout(
            $cashier,
            [['menu_id' => $menu->id, 'qty' => 1]],
            'Budi',
            PaymentMethod::Cash,
        );

        expect(Cache::has(DashboardService::cacheKey()))->toBeFalse();
    });
});

describe('Optimized chart aggregation', function () {
    it('still returns 7 zero-filled sales points ending today', function () {
        $cashier = User::factory()->cashier()->create();
        \App\Models\Transaction::factory()->create([
            'cashier_id' => $cashier->id,
            'total' => 75000,
            'created_at' => now(),
        ]);

        $data = app(DashboardService::class)->getSalesChartData(7);

        expect($data)->toHaveCount(7);
        expect(end($data)['total'])->toBe(75000.0);
        expect($data[0]['total'])->toBe(0.0);
    });
});
