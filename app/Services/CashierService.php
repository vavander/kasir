<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class CashierService
{
    /**
     * Paginated cashier list with transaction count and total sales.
     */
    public function getPaginated(string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return User::query()
            ->where('role', UserRole::Cashier->value)
            ->when($search, fn ($q) => $q->where(fn ($sub) => $sub
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
            ))
            ->withCount('transactions')
            ->withSum('transactions', 'total')
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'avatar_url' => $u->avatar_url,
                'status' => $u->status->value,
                'transactions_count' => (int) $u->transactions_count,
                'transactions_sum_total' => (float) ($u->transactions_sum_total ?? 0),
                'created_at' => $u->created_at->format('d M Y'),
            ]);
    }

    public function create(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => UserRole::Cashier->value,
            'status' => UserStatus::Active->value,
        ]);
    }

    public function update(User $cashier, array $data): User
    {
        $cashier->update([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        return $cashier->refresh();
    }

    public function toggleStatus(User $cashier): User
    {
        $cashier->update([
            'status' => $cashier->isActive()
                ? UserStatus::Inactive->value
                : UserStatus::Active->value,
        ]);

        return $cashier->refresh();
    }

    public function resetPassword(User $cashier, string $password): void
    {
        $cashier->update([
            'password' => Hash::make($password),
        ]);
    }

    /**
     * Detailed statistics for a single cashier.
     */
    public function statistics(User $cashier): array
    {
        $cashier->loadCount('transactions')
            ->loadSum('transactions', 'total');

        return [
            'transactions_count' => (int) $cashier->transactions_count,
            'total_sales' => (float) ($cashier->transactions_sum_total ?? 0),
            'today_transactions' => $cashier->transactions()->whereDate('created_at', today())->count(),
            'today_sales' => (float) $cashier->transactions()->whereDate('created_at', today())->sum('total'),
        ];
    }
}
