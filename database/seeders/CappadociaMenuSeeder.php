<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class CappadociaMenuSeeder extends Seeder
{
    /**
     * Menu list transcribed from the Kedai Cappadocia board.
     * Prices are in rupiah; HPP defaults to 50% of selling price (owner edits later).
     * For Ice/Hot items the Ice price is used.
     */
    public function run(): void
    {
        $menus = [
            // category => [ [name, selling_price], ... ]
            'Espresso Based' => [
                ['Americano Orange', 18000],
                ['Americano Nanas', 18000],
                ['Americano', 16000],
                ['Hazelnut', 22000],
                ['Butterscotch', 22000],
                ['Coffe Latte', 18000],
                ['Pandan', 22000],
                ['Nara', 20000],
                ['Alice', 18000],
                ['Kavo', 22000],
                ['Kopi Susu', 20000],
            ],
            'Non-Coffee' => [
                ['Milo Dino', 19000],
                ['Red Velvet', 19000],
                ['Taro', 19000],
                ['Coklat', 19000],
                ['Hazelnut (Non-Coffee)', 19000],
                ['Avocado', 19000],
                ['Matcha', 19000],
                ['Oreo', 19000],
                ['Choco Cheese', 19000],
            ],
            'Tea' => [
                ['Teh Tarik Brown Sugar', 16000],
                ['Teh Susu', 13000],
                ['Teh', 10000],
                ['Lemon Tea', 10000],
                ['Es Teh Leci', 14000],
            ],
            'Squash' => [
                ['Lemon Squash', 15000],
                ['Melon Squash', 15000],
                ['Mocha Squash', 15000],
                ['Sogem Melon', 19000],
                ['Sogem Nanas', 19000],
                ['Sogem Lemon', 19000],
                ['Biru Squash', 16000],
            ],
            'Manual Brew' => [
                ['Japanese', 23000],
                ['Single Origin', 22000],
            ],
            'Others' => [
                ['Air Mineral', 5000],
                ['Ice Cream/Scoop', 4000],
                ['Es Batu', 1000],
                ['Cheese Cream', 5000],
            ],
        ];

        foreach ($menus as $category => $items) {
            foreach ($items as [$name, $price]) {
                Menu::updateOrCreate(
                    ['name' => $name],
                    [
                        'category' => $category,
                        'selling_price' => $price,
                        'hpp' => (int) round($price * 0.5),
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
