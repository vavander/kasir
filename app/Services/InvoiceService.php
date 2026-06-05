<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function generate(): string
    {
        return DB::transaction(function () {
            $prefix = 'INV-'.now()->format('Ymd').'-';

            $last = Transaction::where('invoice_number', 'like', $prefix.'%')
                ->lockForUpdate()
                ->orderByDesc('invoice_number')
                ->first();

            $sequence = $last
                ? (int) substr($last->invoice_number, -4) + 1
                : 1;

            return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
        });
    }
}
