<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Pagination\LengthAwarePaginator;

class TransactionHistoryService
{
    public function getPaginatedForCashier(int $cashierId, string $search = '', string $date = '', int $perPage = 15): LengthAwarePaginator
    {
        return Transaction::with('cashier:id,name')
            ->where('cashier_id', $cashierId)
            ->when($search, fn ($q) => $q->where('invoice_number', 'like', "%{$search}%"))
            ->when($date, fn ($q) => $q->whereDate('created_at', $date))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getPaginatedForOwner(string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return Transaction::with('cashier:id,name')
            ->when($search, fn ($q) => $q->where('invoice_number', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findForCashier(int $id, int $cashierId): Transaction
    {
        return Transaction::with('items', 'cashier:id,name')
            ->where('cashier_id', $cashierId)
            ->findOrFail($id);
    }

    public function findForOwner(int $id): Transaction
    {
        return Transaction::with('items', 'cashier:id,name')->findOrFail($id);
    }

    private function formatTransaction(Transaction $t): array
    {
        return [
            'id' => $t->id,
            'invoice_number' => $t->invoice_number,
            'cashier_name' => $t->cashier->name ?? '-',
            'payment_method' => $t->payment_method->label(),
            'subtotal' => (float) $t->subtotal,
            'total' => (float) $t->total,
            'created_at' => $t->created_at->format('d M Y, H:i'),
            'items' => $t->relationLoaded('items')
                ? $t->items->map(fn ($item) => [
                    'menu_name' => $item->menu_name,
                    'qty' => $item->qty,
                    'selling_price' => (float) $item->selling_price,
                    'hpp' => (float) $item->hpp,
                    'subtotal' => (float) $item->subtotal,
                ])->toArray()
                : null,
        ];
    }
}
