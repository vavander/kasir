<?php

declare(strict_types=1);

use App\Models\Menu;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

describe('Menu Page Access', function () {
    it('owner can view menu index', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.menus.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Menu/Index')
                ->has('menus')
                ->has('filters')
            );
    });

    it('cashier cannot access menu management', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('owner.menus.index'))
            ->assertStatus(403);
    });

    it('guest is redirected to login', function () {
        $this->get(route('owner.menus.index'))->assertRedirect(route('login'));
    });
});

describe('Create Menu', function () {
    it('owner can view create menu page', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.menus.create'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Owner/Menu/Create'));
    });

    it('owner can create a menu without image', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.menus.store'), [
            'name' => 'Nasi Goreng Spesial',
            'hpp' => 10000,
            'selling_price' => 18000,
            'is_active' => true,
        ])->assertRedirect(route('owner.menus.index'));

        $this->assertDatabaseHas('menus', [
            'name' => 'Nasi Goreng Spesial',
            'hpp' => 10000,
            'selling_price' => 18000,
        ]);
    });

    it('owner can create a menu with image', function () {
        Storage::fake('public');
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.menus.store'), [
            'name' => 'Mie Goreng',
            'hpp' => 8000,
            'selling_price' => 15000,
            'is_active' => true,
            'image' => UploadedFile::fake()->create('mie.jpg', 100, 'image/jpeg'),
        ])->assertRedirect(route('owner.menus.index'));

        $menu = Menu::where('name', 'Mie Goreng')->first();
        expect($menu)->not->toBeNull();
        expect($menu->image)->not->toBeNull();
        Storage::disk('public')->assertExists($menu->image);
    });

    it('menu name must be unique', function () {
        $owner = User::factory()->owner()->create();
        Menu::factory()->create(['name' => 'Soto Ayam']);

        $this->actingAs($owner)->post(route('owner.menus.store'), [
            'name' => 'Soto Ayam',
            'hpp' => 10000,
            'selling_price' => 15000,
        ])->assertSessionHasErrors('name');
    });

    it('hpp cannot be negative', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.menus.store'), [
            'name' => 'Menu Test',
            'hpp' => -100,
            'selling_price' => 15000,
        ])->assertSessionHasErrors('hpp');
    });

    it('selling price cannot be negative', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.menus.store'), [
            'name' => 'Menu Test',
            'hpp' => 5000,
            'selling_price' => -500,
        ])->assertSessionHasErrors('selling_price');
    });

    it('image must be valid format', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.menus.store'), [
            'name' => 'Menu Test',
            'hpp' => 5000,
            'selling_price' => 10000,
            'image' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
            // PDF should fail mimes:jpg,jpeg,png,webp validation
        ])->assertSessionHasErrors('image');
    });
});

describe('Edit Menu', function () {
    it('owner can view edit menu page', function () {
        $owner = User::factory()->owner()->create();
        $menu = Menu::factory()->create();

        $this->actingAs($owner)
            ->get(route('owner.menus.edit', $menu))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Menu/Edit')
                ->has('menu')
            );
    });

    it('owner can update a menu', function () {
        $owner = User::factory()->owner()->create();
        $menu = Menu::factory()->create(['name' => 'Lama', 'hpp' => 5000, 'selling_price' => 10000]);

        $this->actingAs($owner)->put(route('owner.menus.update', $menu), [
            'name' => 'Baru',
            'hpp' => 6000,
            'selling_price' => 12000,
            'is_active' => true,
        ])->assertRedirect(route('owner.menus.index'));

        expect($menu->fresh()->name)->toBe('Baru');
        expect((float) $menu->fresh()->hpp)->toBe(6000.0);
    });

    it('owner can update menu and replace image', function () {
        Storage::fake('public');
        $owner = User::factory()->owner()->create();
        $menu = Menu::factory()->create();

        $this->actingAs($owner)->put(route('owner.menus.update', $menu), [
            'name' => $menu->name,
            'hpp' => $menu->hpp,
            'selling_price' => $menu->selling_price,
            'is_active' => true,
            'image' => UploadedFile::fake()->create('new.jpg', 100, 'image/jpeg'),
        ])->assertRedirect(route('owner.menus.index'));

        expect($menu->fresh()->image)->not->toBeNull();
    });

    it('name unique rule ignores current menu on update', function () {
        $owner = User::factory()->owner()->create();
        $menu = Menu::factory()->create(['name' => 'Existing Menu']);

        $this->actingAs($owner)->put(route('owner.menus.update', $menu), [
            'name' => 'Existing Menu',
            'hpp' => 5000,
            'selling_price' => 10000,
            'is_active' => true,
        ])->assertRedirect(route('owner.menus.index'));
    });
});

describe('Delete Menu', function () {
    it('owner can delete a menu', function () {
        $owner = User::factory()->owner()->create();
        $menu = Menu::factory()->create();

        $this->actingAs($owner)
            ->delete(route('owner.menus.destroy', $menu))
            ->assertRedirect(route('owner.menus.index'));

        $this->assertDatabaseMissing('menus', ['id' => $menu->id]);
    });

    it('deleting menu removes its image', function () {
        Storage::fake('public');
        $owner = User::factory()->owner()->create();

        $file = UploadedFile::fake()->create('food.jpg', 100, 'image/jpeg');
        $path = $file->store('menus', 'public');
        $menu = Menu::factory()->create(['image' => $path]);

        Storage::disk('public')->assertExists($path);

        $this->actingAs($owner)->delete(route('owner.menus.destroy', $menu));

        Storage::disk('public')->assertMissing($path);
    });
});

describe('Toggle Menu Status', function () {
    it('owner can toggle menu status to inactive', function () {
        $owner = User::factory()->owner()->create();
        $menu = Menu::factory()->create(['is_active' => true]);

        $this->actingAs($owner)
            ->patch(route('owner.menus.toggle-status', $menu))
            ->assertRedirect();

        expect($menu->fresh()->is_active)->toBeFalse();
    });

    it('owner can toggle menu status back to active', function () {
        $owner = User::factory()->owner()->create();
        $menu = Menu::factory()->inactive()->create();

        $this->actingAs($owner)
            ->patch(route('owner.menus.toggle-status', $menu))
            ->assertRedirect();

        expect($menu->fresh()->is_active)->toBeTrue();
    });
});

describe('Menu Search', function () {
    it('search filters menus by name', function () {
        $owner = User::factory()->owner()->create();
        Menu::factory()->create(['name' => 'Nasi Goreng']);
        Menu::factory()->create(['name' => 'Mie Goreng']);
        Menu::factory()->create(['name' => 'Soto Ayam']);

        $this->actingAs($owner)
            ->get(route('owner.menus.index', ['search' => 'goreng']))
            ->assertInertia(fn ($page) => $page
                ->has('menus.data', 2)
            );
    });

    it('empty search returns all menus', function () {
        $owner = User::factory()->owner()->create();
        Menu::factory()->count(3)->create();

        $this->actingAs($owner)
            ->get(route('owner.menus.index'))
            ->assertInertia(fn ($page) => $page
                ->has('menus.data', 3)
            );
    });
});
