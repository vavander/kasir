<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\ReceiptService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class TransactionController extends Controller
{
    public function __construct(private readonly ReceiptService $receiptService) {}

    public function receipt(Request $request, Transaction $transaction): Response
    {
        // Cashier can only print their own receipts
        if ($request->user()->isCashier() && $transaction->cashier_id !== $request->user()->id) {
            abort(403);
        }

        $paidAmount = (int) $request->query('paid_amount', 0);

        return $this->receiptService->generate($transaction, $paidAmount);
    }
}
