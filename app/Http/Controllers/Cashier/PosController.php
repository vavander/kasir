<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\CheckoutRequest;
use App\Models\Menu;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function __construct(private readonly TransactionService $transactionService) {}

    public function index(): Response
    {
        $menus = Menu::active()
            ->select('id', 'name', 'category', 'selling_price', 'image')
            ->orderBy('name')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'category' => $m->category,
                'selling_price' => (float) $m->selling_price,
                'image_url' => $m->image_url,
            ]);

        $categories = $menus
            ->pluck('category')
            ->filter()
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('Cashier/Pos', [
            'menus' => $menus,
            'categories' => $categories,
        ]);
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $transaction = $this->transactionService->checkout(
            cashier: Auth::user(),
            items: $request->validated('items'),
            customerName: $request->validated('customer_name'),
            paymentMethod: $request->getPaymentMethod(),
            payLater: ! $request->isPaidNow(),
        );

        return response()->json([
            'transaction' => [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'customer_name' => $transaction->customer_name,
                'payment_method' => $transaction->payment_method?->label() ?? '-',
                'payment_status' => $transaction->payment_status->value,
                'subtotal' => (float) $transaction->subtotal,
                'total' => (float) $transaction->total,
                'cashier_name' => $transaction->cashier->name,
                'created_at' => $transaction->created_at->format('d/m/Y H:i'),
                'items' => $transaction->items->map(fn ($item) => [
                    'menu_name' => $item->menu_name,
                    'qty' => $item->qty,
                    'selling_price' => (float) $item->selling_price,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ],
        ], 201);
    }
}
