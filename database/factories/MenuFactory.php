<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Menu;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Menu>
 */
class MenuFactory extends Factory
{
    public function definition(): array
    {
        $hpp = fake()->numberBetween(5000, 50000);

        return [
            'name' => fake()->unique()->words(3, true),
            'hpp' => $hpp,
            'selling_price' => $hpp + fake()->numberBetween(2000, 20000),
            'image' => null,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }
}
