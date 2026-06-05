<?php

declare(strict_types=1);

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function index(): Response
    {
        return Inertia::render('Owner/Dashboard', [
            'summary' => $this->dashboardService->getTodaySummary(),
            'salesChart' => $this->dashboardService->getSalesChartData(7),
            'expenseChart' => $this->dashboardService->getExpenseChartData(7),
            'topMenus' => $this->dashboardService->getTopMenus(5),
            'recentTransactions' => $this->dashboardService->getRecentTransactions(5),
            'recentExpenses' => $this->dashboardService->getRecentExpenses(5),
        ]);
    }
}
