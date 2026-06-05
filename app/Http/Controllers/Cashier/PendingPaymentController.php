<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cashier;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\SettlePaymentRequest;
use App\Models\Transaction;
use App\Services\PaymentService;
use App\Services\PendingPaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PendingPaymentController extends Controller
{
    public function __construct(
        private readonly PendingPaymentService $pendingService,
        private readonly PaymentService $paymentService,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $date = $request->string('date')->trim()->value();

        return Inertia::render('Cashier/Pending/Index', [
            'pending' => $this->pendingService->getPaginated(Auth::id(), $search, $date),
            'filters' => ['search' => $search, 'date' => $date],
        ]);
    }

    public function settle(SettlePaymentRequest $request, Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->cashier_id === Auth::id(), 403);
        abort_unless($transaction->payment_status === PaymentStatus::Unpaid, 404);

        $this->paymentService->settle($transaction, $request->getPaymentMethod(), (float) $request->validated('paid_amount'));

        return back()->with('success', 'Pembayaran berhasil diselesaikan.');
    }
}
