<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Pagination\LengthAwarePaginator;

class PendingPaymentService
{
    /**
     * Unpaid transactions, optionally scoped to one cashier, with name/date filters.
     */
    public function getPaginated(?int $cashierId, string $search = '', string $date = '', int $perPage = 15): LengthAwarePaginator
    {
        return Transaction::with('cashier:id,name')
            ->unpaid()
            ->when($cashierId, fn ($q) => $q->where('cashier_id', $cashierId))
            ->when($search, fn ($q) => $q->where('customer_name', 'like', "%{$search}%"))
            ->when($date, fn ($q) => $q->whereDate('created_at', $date))
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Transaction $t) => [
                'id' => $t->id,
                'invoice_number' => $t->invoice_number,
                'customer_name' => $t->customer_name,
                'cashier_name' => $t->cashier->name ?? '-',
                'total' => (float) $t->total,
                'payment_status' => $t->payment_status->value,
                'created_at' => $t->created_at->format('d M Y, H:i'),
            ]);
    }

    public function pendingCount(): int
    {
        return Transaction::unpaid()->count();
    }

    public function pendingValue(): float
    {
        return (float) Transaction::unpaid()->sum('total');
    }
}
