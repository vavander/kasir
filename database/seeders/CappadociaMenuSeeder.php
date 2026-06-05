<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class CappadociaMenuSeeder extends Seeder
{
    /**
     * Menu list transcribed from the Kedai Cappadocia board.
     * Prices in rupiah; HPP defaults to 50% of selling price (owner edits later).
     * Drinks served both cold & hot are split: cold -> "Ice" category,
     * a separate "(Hot)" entry -> "Hot" category.
     */
    public function run(): void
    {
        // Single-temperature items keep their type category. [name, price]
        $single = [
            'Espresso Based' => [
                ['Americano Orange', 18000],
                ['Americano Nanas', 18000],
                ['Americano', 16000],
                ['Hazelnut', 22000],
                ['Butterscotch', 22000],
                ['Pandan', 22000],
                ['Alice', 18000],
                ['Kavo', 22000],
            ],
            'Tea' => [
                ['Teh Tarik Brown Sugar', 16000],
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

        // Drinks with both Ice & Hot. [name, ice price, hot price]
        $dual = [
            ['Coffe Latte', 18000, 16000],
            ['Nara', 20000, 16000],
            ['Kopi Susu', 20000, 15000],
            ['Milo Dino', 19000, 15000],
            ['Red Velvet', 19000, 15000],
            ['Taro', 19000, 15000],
            ['Coklat', 19000, 15000],
            ['Hazelnut (Non-Coffee)', 19000, 15000],
            ['Avocado', 19000, 15000],
            ['Matcha', 19000, 15000],
            ['Oreo', 19000, 15000],
            ['Choco Cheese', 19000, 15000],
            ['Teh Susu', 13000, 13000],
            ['Teh', 10000, 10000],
            ['Lemon Tea', 10000, 10000],
        ];

        foreach ($single as $category => $items) {
            foreach ($items as [$name, $price]) {
                $this->upsert($name, $category, $price);
            }
        }

        foreach ($dual as [$name, $ice, $hot]) {
            $this->upsert($name, 'Ice', $ice);
            $this->upsert($name.' (Hot)', 'Hot', $hot);
        }
    }

    private function upsert(string $name, string $category, int $price): void
    {
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
