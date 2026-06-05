<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseService
{
    public function getPaginatedForOwner(string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return Expense::with('user:id,name')
            ->when($search, fn ($q) => $q->where(fn ($sub) => $sub
                ->where('description', 'like', "%{$search}%")
                ->orWhere('category', 'like', "%{$search}%")
            ))
            ->latest('expense_date')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getPaginatedForUser(int $userId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return Expense::where('user_id', $userId)
            ->when($search, fn ($q) => $q->where(fn ($sub) => $sub
                ->where('description', 'like', "%{$search}%")
                ->orWhere('category', 'like', "%{$search}%")
            ))
            ->latest('expense_date')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getTodaySummaryForOwner(): array
    {
        return [
            'today' => (float) Expense::whereDate('expense_date', today())->sum('amount'),
            'this_month' => (float) Expense::whereMonth('expense_date', now()->month)
                ->whereYear('expense_date', now()->year)
                ->sum('amount'),
        ];
    }

    public function create(User $user, array $data): Expense
    {
        return Expense::create([
            ...$data,
            'user_id' => $user->id,
        ]);
    }

    public function update(Expense $expense, array $data): Expense
    {
        $expense->update($data);

        return $expense->fresh();
    }

    public function delete(Expense $expense): void
    {
        $expense->delete();
    }
}
