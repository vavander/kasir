<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Expense;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getTodaySummary(): array
    {
        $omzet = Transaction::whereDate('created_at', today())
            ->sum('total');

        $hpp = TransactionItem::whereHas('transaction', function ($q) {
            $q->whereDate('created_at', today());
        })->sum(DB::raw('hpp * qty'));

        $pengeluaran = Expense::whereDate('expense_date', today())
            ->sum('amount');

        $labaKotor = (float) $omzet - (float) $hpp;
        $labaBersih = $labaKotor - (float) $pengeluaran;

        return [
            'omzet' => (float) $omzet,
            'hpp' => (float) $hpp,
            'pengeluaran' => (float) $pengeluaran,
            'laba_bersih' => $labaBersih,
        ];
    }

    public function getSalesChartData(int $days = 7): array
    {
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = today()->subDays($i);

            $total = Transaction::whereDate('created_at', $date)->sum('total');

            $data[] = [
                'date' => $date->format('d M'),
                'total' => (float) $total,
            ];
        }

        return $data;
    }

    public function getExpenseChartData(int $days = 7): array
    {
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = today()->subDays($i);

            $total = Expense::whereDate('expense_date', $date)->sum('amount');

            $data[] = [
                'date' => $date->format('d M'),
                'total' => (float) $total,
            ];
        }

        return $data;
    }

    public function getTopMenus(int $limit = 5): array
    {
        return TransactionItem::select(
            'menu_name',
            DB::raw('SUM(qty) as total_qty'),
            DB::raw('SUM(subtotal) as total_revenue'),
        )
            ->groupBy('menu_name')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get()
            ->map(fn ($item) => [
                'menu_name' => $item->menu_name,
                'total_qty' => (int) $item->total_qty,
                'total_revenue' => (float) $item->total_revenue,
            ])
            ->toArray();
    }

    public function getRecentTransactions(int $limit = 5): array
    {
        return Transaction::with('cashier:id,name')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'invoice_number' => $t->invoice_number,
                'cashier_name' => $t->cashier->name ?? '-',
                'payment_method' => $t->payment_method->label(),
                'total' => (float) $t->total,
                'created_at' => $t->created_at->format('d M Y, H:i'),
            ])
            ->toArray();
    }

    public function getRecentExpenses(int $limit = 5): array
    {
        return Expense::with('user:id,name')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'category' => $e->category->label(),
                'amount' => (float) $e->amount,
                'description' => $e->description,
                'created_by' => $e->user->name ?? '-',
                'expense_date' => Carbon::parse($e->expense_date)->format('d M Y'),
            ])
            ->toArray();
    }
}
