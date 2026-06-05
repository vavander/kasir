<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Expense;
use App\Models\Transaction;
use App\Models\User;

class CashierDashboardService
{
    /**
     * Today's summary scoped to a single cashier.
     * Intentionally excludes HPP / profit — cashiers must not see those.
     */
    public function getTodaySummary(User $cashier): array
    {
        return [
            'transactions_today' => Transaction::where('cashier_id', $cashier->id)
                ->whereDate('created_at', today())
                ->count(),
            'revenue_today' => (float) Transaction::where('cashier_id', $cashier->id)
                ->whereDate('created_at', today())
                ->sum('total'),
            'expenses_today' => (float) Expense::where('user_id', $cashier->id)
                ->whereDate('expense_date', today())
                ->sum('amount'),
        ];
    }

    public function getRecentTransactions(User $cashier, int $limit = 5): array
    {
        return Transaction::where('cashier_id', $cashier->id)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Transaction $t) => [
                'id' => $t->id,
                'invoice_number' => $t->invoice_number,
                'payment_method' => $t->payment_method->label(),
                'total' => (float) $t->total,
                'created_at' => $t->created_at->format('d M Y, H:i'),
            ])
            ->toArray();
    }
}
