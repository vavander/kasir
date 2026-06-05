<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Expense;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Resolve the active reporting period from filter input.
     *
     * @return array{start: Carbon, end: Carbon, mode: string, label: string}
     */
    public function resolveRange(array $filters): array
    {
        $mode = $filters['mode'] ?? 'daily';

        return match ($mode) {
            'monthly' => $this->monthlyRange($filters['month'] ?? null),
            'custom' => $this->customRange($filters['start'] ?? null, $filters['end'] ?? null),
            default => $this->dailyRange($filters['date'] ?? null),
        };
    }

    /**
     * Build the full report payload for a resolved period.
     */
    public function generate(Carbon $start, Carbon $end): array
    {
        $start = $start->copy()->startOfDay();
        $end = $end->copy()->endOfDay();

        $summary = $this->summary($start, $end);

        return [
            'summary' => $summary,
            'daily' => $this->dailyBreakdown($start, $end),
            'expense_by_category' => $this->expenseByCategory($start, $end),
            'top_menus' => $this->topMenus($start, $end),
        ];
    }

    private function summary(Carbon $start, Carbon $end): array
    {
        $omzet = (float) Transaction::whereBetween('created_at', [$start, $end])->sum('total');

        $hpp = (float) TransactionItem::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->sum(DB::raw('transaction_items.hpp * transaction_items.qty'));

        $pengeluaran = (float) Expense::query()
            ->whereDate('expense_date', '>=', $start->toDateString())
            ->whereDate('expense_date', '<=', $end->toDateString())
            ->sum('amount');

        $labaKotor = $omzet - $hpp;

        $paidTotal = (float) Transaction::paid()->whereBetween('created_at', [$start, $end])->sum('total');
        $unpaidTotal = (float) Transaction::unpaid()->whereBetween('created_at', [$start, $end])->sum('total');

        return [
            'omzet' => $omzet,
            'hpp' => $hpp,
            'laba_kotor' => $labaKotor,
            'pengeluaran' => $pengeluaran,
            'laba_bersih' => $labaKotor - $pengeluaran,
            'paid_total' => $paidTotal,
            'unpaid_total' => $unpaidTotal,
            'pending_amount' => $unpaidTotal,
        ];
    }

    /**
     * Per-day omzet / hpp / pengeluaran / laba bersih within the range.
     * Computed in three grouped queries, then zero-filled per day.
     */
    private function dailyBreakdown(Carbon $start, Carbon $end): array
    {
        $omzetByDay = Transaction::query()
            ->selectRaw('DATE(created_at) as d, SUM(total) as t')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('d')
            ->pluck('t', 'd');

        $hppByDay = TransactionItem::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->selectRaw('DATE(transactions.created_at) as d, SUM(transaction_items.hpp * transaction_items.qty) as t')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->groupBy('d')
            ->pluck('t', 'd');

        $expenseByDay = Expense::query()
            ->selectRaw('DATE(expense_date) as d, SUM(amount) as t')
            ->whereDate('expense_date', '>=', $start->toDateString())
            ->whereDate('expense_date', '<=', $end->toDateString())
            ->groupBy('d')
            ->pluck('t', 'd');

        $rows = [];
        $cursor = $start->copy()->startOfDay();
        $last = $end->copy()->startOfDay();

        while ($cursor->lte($last)) {
            $key = $cursor->toDateString();
            $omzet = (float) ($omzetByDay[$key] ?? 0);
            $hpp = (float) ($hppByDay[$key] ?? 0);
            $pengeluaran = (float) ($expenseByDay[$key] ?? 0);

            $rows[] = [
                'date' => $key,
                'label' => $cursor->format('d M Y'),
                'omzet' => $omzet,
                'hpp' => $hpp,
                'pengeluaran' => $pengeluaran,
                'laba_bersih' => $omzet - $hpp - $pengeluaran,
            ];

            $cursor->addDay();
        }

        return $rows;
    }

    private function expenseByCategory(Carbon $start, Carbon $end): array
    {
        return Expense::query()
            ->selectRaw('category, SUM(amount) as total')
            ->whereDate('expense_date', '>=', $start->toDateString())
            ->whereDate('expense_date', '<=', $end->toDateString())
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category instanceof \BackedEnum ? $row->category->value : (string) $row->category,
                'total' => (float) $row->total,
            ])
            ->toArray();
    }

    private function topMenus(Carbon $start, Carbon $end, int $limit = 5): array
    {
        return TransactionItem::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->selectRaw('transaction_items.menu_name, SUM(transaction_items.qty) as total_qty, SUM(transaction_items.subtotal) as total_revenue')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->groupBy('transaction_items.menu_name')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'menu_name' => $row->menu_name,
                'total_qty' => (int) $row->total_qty,
                'total_revenue' => (float) $row->total_revenue,
            ])
            ->toArray();
    }

    private function dailyRange(?string $date): array
    {
        $day = $this->parseOrNull($date) ?? today();

        return [
            'start' => $day->copy(),
            'end' => $day->copy(),
            'mode' => 'daily',
            'label' => $day->format('d M Y'),
        ];
    }

    private function monthlyRange(?string $month): array
    {
        $base = $month ? Carbon::createFromFormat('Y-m', $month) : today();

        return [
            'start' => $base->copy()->startOfMonth(),
            'end' => $base->copy()->endOfMonth(),
            'mode' => 'monthly',
            'label' => $base->translatedFormat('F Y'),
        ];
    }

    private function customRange(?string $start, ?string $end): array
    {
        $startDate = $this->parseOrNull($start) ?? today();
        $endDate = $this->parseOrNull($end) ?? today();

        // Guard against reversed input.
        if ($startDate->gt($endDate)) {
            [$startDate, $endDate] = [$endDate, $startDate];
        }

        return [
            'start' => $startDate->copy(),
            'end' => $endDate->copy(),
            'mode' => 'custom',
            'label' => $startDate->format('d M Y').' — '.$endDate->format('d M Y'),
        ];
    }

    private function parseOrNull(?string $value): ?Carbon
    {
        if (! $value) {
            return null;
        }

        return Carbon::parse($value)->startOfDay();
    }
}
