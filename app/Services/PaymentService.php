<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Transaction;

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
}
