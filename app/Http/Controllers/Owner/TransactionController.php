<?php

declare(strict_types=1);

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Services\TransactionHistoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function __construct(private readonly TransactionHistoryService $service) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Owner/Transaction/Index', [
            'transactions' => $this->service->getPaginatedForOwner(search: $search),
            'filters' => ['search' => $search],
        ]);
    }

    public function show(int $id): Response
    {
        $transaction = $this->service->findForOwner($id);

        return Inertia::render('Owner/Transaction/Show', [
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
                    'hpp' => (float) $item->hpp,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ],
        ]);
    }
}
