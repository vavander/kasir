<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Expense;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /** Seconds to cache the assembled owner dashboard payload. */
    public const CACHE_TTL = 60;

    public static function cacheKey(?string $date = null): string
    {
        return 'dashboard:'.($date ?? today()->toDateString());
    }

    /** Invalidate today's cached dashboard (called after sales/expense writes). */
    public static function forgetTodayCache(): void
    {
        Cache::forget(self::cacheKey());
    }

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

    public function getPendingSummary(): array
    {
        return [
            'count' => Transaction::unpaid()->count(),
            'value' => (float) Transaction::unpaid()->sum('total'),
        ];
    }

    public function getSalesChartData(int $days = 7): array
    {
        $start = today()->subDays($days - 1)->startOfDay();
        $end = today()->endOfDay();

        $byDay = Transaction::query()
            ->selectRaw('DATE(created_at) as d, SUM(total) as t')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('d')
            ->pluck('t', 'd');

        return $this->fillDailySeries($days, $byDay);
    }

    public function getExpenseChartData(int $days = 7): array
    {
        $start = today()->subDays($days - 1);
        $end = today();

        $byDay = Expense::query()
            ->selectRaw('DATE(expense_date) as d, SUM(amount) as t')
            ->whereDate('expense_date', '>=', $start->toDateString())
            ->whereDate('expense_date', '<=', $end->toDateString())
            ->groupBy('d')
            ->pluck('t', 'd');

        return $this->fillDailySeries($days, $byDay);
    }

    /**
     * Build a zero-filled, chronological daily series ending today.
     */
    private function fillDailySeries(int $days, \Illuminate\Support\Collection $byDay): array
    {
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = today()->subDays($i);

            $data[] = [
                'date' => $date->format('d M'),
                'total' => (float) ($byDay[$date->toDateString()] ?? 0),
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
                'payment_method' => $t->payment_method?->label() ?? '-',
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
