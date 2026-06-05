<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Services\TransactionHistoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TransactionHistoryController extends Controller
{
    public function __construct(private readonly TransactionHistoryService $service) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $date = $request->string('date')->trim()->value();

        return Inertia::render('Cashier/Transaction/Index', [
            'transactions' => $this->service->getPaginatedForCashier(
                cashierId: Auth::id(),
                search: $search,
                date: $date,
            ),
            'filters' => ['search' => $search, 'date' => $date],
        ]);
    }

    public function show(int $id): Response
    {
        $transaction = $this->service->findForCashier($id, Auth::id());

        return Inertia::render('Cashier/Transaction/Show', [
            'transaction' => [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'cashier_name' => $transaction->cashier->name ?? '-',
                'payment_method' => $transaction->payment_method->label(),
                'subtotal' => (float) $transaction->subtotal,
                'total' => (float) $transaction->total,
                'created_at' => $transaction->created_at->format('d M Y, H:i'),
                'items' => $transaction->items->map(fn ($item) => [
                    'menu_name' => $item->menu_name,
                    'qty' => $item->qty,
                    'selling_price' => (float) $item->selling_price,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ],
        ]);
    }
}
