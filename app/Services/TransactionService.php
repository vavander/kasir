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
        $customerName = trim($customerName);

        // Load every referenced menu in a single query (avoids N+1).
        $menus = Menu::whereIn('id', array_column($items, 'menu_id'))->get()->keyBy('id');

        $transaction = DB::transaction(function () use ($cashier, $items, $customerName, $paymentMethod, $payLater, $menus) {
            // Pay-later orders for a customer who already has an open (unpaid)
            // tab are merged into that tab instead of creating a new bill.
            $transaction = $payLater
                ? $this->findOpenTab($customerName)
                : null;

            $transaction ??= Transaction::create([
                'invoice_number' => $this->invoiceService->generate(),
                'cashier_id' => $cashier->id,
                'customer_name' => $customerName,
                'payment_method' => $payLater ? null : $paymentMethod?->value,
                'payment_status' => $payLater
                    ? PaymentStatus::Unpaid->value
                    : PaymentStatus::Paid->value,
                'subtotal' => 0,
                'total' => 0,
            ]);

            $addedSubtotal = 0;
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

                $addedSubtotal += $itemSubtotal;
            }

            $transaction->items()->createMany($rows);

            $newSubtotal = (float) $transaction->subtotal + $addedSubtotal;
            $transaction->update([
                'subtotal' => $newSubtotal,
                'total' => $newSubtotal,
            ]);

            return $transaction->load('items', 'cashier');
        });

        DashboardService::forgetTodayCache();

        return $transaction;
    }

    /**
     * Find an existing open (unpaid) tab for a customer, regardless of which
     * cashier opened it — supports shift handover.
     */
    private function findOpenTab(string $customerName): ?Transaction
    {
        return Transaction::unpaid()
            ->whereRaw('LOWER(customer_name) = ?', [mb_strtolower($customerName)])
            ->lockForUpdate()
            ->latest('id')
            ->first();
    }
}
