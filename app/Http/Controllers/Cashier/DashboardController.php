<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Services\CashierDashboardService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly CashierDashboardService $service) {}

    public function index(): Response
    {
        $cashier = Auth::user();

        return Inertia::render('Cashier/Dashboard', [
            'summary' => $this->service->getTodaySummary($cashier),
            'recentTransactions' => $this->service->getRecentTransactions($cashier),
        ]);
    }
}
