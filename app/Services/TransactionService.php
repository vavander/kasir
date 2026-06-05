<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Menu;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public function __construct(private readonly InvoiceService $invoiceService) {}

    /**
     * @param  array<int, array{menu_id: int, qty: int}>  $items
     */
    public function checkout(
        User $cashier,
        array $items,
        string $customerName,
        ?PaymentMethod $paymentMethod,
        bool $payLater = false,
    ): Transaction {
        // Load every referenced menu in a single query (avoids N+1).
        $menus = Menu::whereIn('id', array_column($items, 'menu_id'))->get()->keyBy('id');

        $transaction = DB::transaction(function () use ($cashier, $items, $customerName, $paymentMethod, $payLater, $menus) {
            $invoiceNumber = $this->invoiceService->generate();

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'cashier_id' => $cashier->id,
                'customer_name' => $customerName,
                'payment_method' => $payLater ? null : $paymentMethod?->value,
                'payment_status' => $payLater
                    ? PaymentStatus::Unpaid->value
                    : PaymentStatus::Paid->value,
                'subtotal' => 0,
                'total' => 0,
            ]);

            $subtotal = 0;
            $rows = [];

            foreach ($items as $item) {
                /** @var Menu $menu */
                $menu = $menus->get($item['menu_id']) ?? Menu::findOrFail($item['menu_id']);
                $qty = (int) $item['qty'];
                $itemSubtotal = (float) $menu->selling_price * $qty;

                $rows[] = [
                    'menu_id' => $menu->id,
                    'menu_name' => $menu->name,
                    'qty' => $qty,
                    'hpp' => $menu->hpp,
                    'selling_price' => $menu->selling_price,
                    'subtotal' => $itemSubtotal,
                ];

                $subtotal += $itemSubtotal;
            }

            $transaction->items()->createMany($rows);

            $transaction->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);

            return $transaction->load('items', 'cashier');
        });

        DashboardService::forgetTodayCache();

        return $transaction;
    }
}
