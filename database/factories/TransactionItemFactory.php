<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Menu;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TransactionItem>
 */
class TransactionItemFactory extends Factory
{
    public function definition(): array
    {
        $menu = Menu::factory()->create();
        $qty = fake()->numberBetween(1, 10);

        return [
            'transaction_id' => Transaction::factory(),
            'menu_id' => $menu->id,
            'menu_name' => $menu->name,
            'qty' => $qty,
            'hpp' => $menu->hpp,
            'selling_price' => $menu->selling_price,
            'subtotal' => (float) $menu->selling_price * $qty,
        ];
    }
}
