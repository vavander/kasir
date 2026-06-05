<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReceiptService
{
    public function generate(Transaction $transaction, int $paidAmount = 0): Response
    {
        $transaction->load('items', 'cashier');
        $setting = Setting::current();

        $change = max(0, $paidAmount - (float) $transaction->total);

        $pdf = Pdf::loadView('receipt', [
            'transaction' => $transaction,
            'setting' => $setting,
            'paid_amount' => $paidAmount,
            'change' => $change,
        ]);

        $pdf->setPaper([0, 0, 226.77, 800], 'portrait'); // 80mm width

        return $pdf->stream('receipt-'.$transaction->invoice_number.'.pdf');
    }
}
