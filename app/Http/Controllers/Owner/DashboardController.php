<?php

declare(strict_types=1);

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function index(): Response
    {
        // Cache the assembled payload briefly so repeated dashboard loads
        // don't re-run the aggregation queries on every request.
        $data = Cache::remember(
            DashboardService::cacheKey(),
            DashboardService::CACHE_TTL,
            fn (): array => [
                'summary' => $this->dashboardService->getTodaySummary(),
                'salesChart' => $this->dashboardService->getSalesChartData(7),
                'expenseChart' => $this->dashboardService->getExpenseChartData(7),
                'topMenus' => $this->dashboardService->getTopMenus(5),
                'recentTransactions' => $this->dashboardService->getRecentTransactions(5),
                'recentExpenses' => $this->dashboardService->getRecentExpenses(5),
            ],
        );

        return Inertia::render('Owner/Dashboard', $data);
    }
}
