<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Transaction;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Settle an unpaid transaction. Returns the change due.
     */
    public function settle(Transaction $transaction, PaymentMethod $paymentMethod, float $paidAmount): float
    {
        $transaction->update([
            'payment_method' => $paymentMethod->value,
            'payment_status' => PaymentStatus::Paid->value,
        ]);

        DashboardService::forgetTodayCache();

        return max(0, $paidAmount - (float) $transaction->total);
    }

    /**
     * Settle several unpaid transactions in one payment (e.g. one person pays
     * for multiple tabs). All are marked paid with the same payment method.
     *
     * @param  \Illuminate\Support\Collection<int, Transaction>  $transactions
     */
    public function settleMany(Collection $transactions, PaymentMethod $paymentMethod): void
    {
        DB::transaction(function () use ($transactions, $paymentMethod): void {
            foreach ($transactions as $transaction) {
                $transaction->update([
                    'payment_method' => $paymentMethod->value,
                    'payment_status' => PaymentStatus::Paid->value,
                ]);
            }
        });

        DashboardService::forgetTodayCache();
    }
}
