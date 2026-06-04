<?php

declare(strict_types=1);

use App\Models\Menu;

describe('Menu Model', function () {
    it('has correct fillable fields', function () {
        $menu = new Menu();

        expect($menu->getFillable())->toContain('name', 'hpp', 'selling_price', 'image', 'is_active');
    });

    it('casts is_active to boolean', function () {
        $menu = Menu::factory()->create(['is_active' => true]);

        expect($menu->is_active)->toBeBool()->toBeTrue();
    });

    it('casts hpp and selling_price to decimal', function () {
        $menu = Menu::factory()->create(['hpp' => 10000, 'selling_price' => 18000]);

        expect($menu->hpp)->toBeString();
        expect($menu->selling_price)->toBeString();
    });

    it('scope active returns only active menus', function () {
        Menu::factory()->count(3)->create(['is_active' => true]);
        Menu::factory()->inactive()->count(2)->create();

        $active = Menu::active()->get();

        expect($active)->toHaveCount(3);
        expect($active)->each(fn ($m) => $m->is_active->toBeTrue());
    });

    it('has transaction_items relationship', function () {
        $menu = Menu::factory()->create();

        expect($menu->transactionItems())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
    });

    it('image_url returns null when no image', function () {
        $menu = Menu::factory()->create(['image' => null]);

        expect($menu->image_url)->toBeNull();
    });

    it('name must be unique', function () {
        Menu::factory()->create(['name' => 'Nasi Goreng']);

        expect(fn () => Menu::factory()->create(['name' => 'Nasi Goreng']))
            ->toThrow(\Illuminate\Database\QueryException::class);
    });
});
