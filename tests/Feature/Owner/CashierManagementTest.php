<?php

declare(strict_types=1);

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

describe('Cashier Management Access', function () {
    it('owner can view cashier list', function () {
        $owner = User::factory()->owner()->create();
        User::factory()->cashier()->count(2)->create();

        $this->actingAs($owner)
            ->get(route('owner.cashiers.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Cashier/Index')
                ->has('cashiers.data', 2)
                ->has('filters')
            );
    });

    it('cashier cannot access cashier management', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('owner.cashiers.index'))
            ->assertStatus(403);
    });

    it('guest is redirected to login', function () {
        $this->get(route('owner.cashiers.index'))->assertRedirect(route('login'));
    });
});

describe('Create Cashier', function () {
    it('owner can create a cashier with role auto-assigned', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.cashiers.store'), [
            'name' => 'Budi Kasir',
            'email' => 'budi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertRedirect(route('owner.cashiers.index'));

        $this->assertDatabaseHas('users', [
            'email' => 'budi@example.com',
            'role' => 'cashier',
            'status' => 'active',
        ]);

        $cashier = User::where('email', 'budi@example.com')->first();
        expect(Hash::check('password123', $cashier->password))->toBeTrue();
        expect($cashier->isCashier())->toBeTrue();
    });

    it('requires name, email and password', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.cashiers.store'), [])
            ->assertSessionHasErrors(['name', 'email', 'password']);
    });

    it('rejects duplicate email', function () {
        $owner = User::factory()->owner()->create();
        User::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($owner)->post(route('owner.cashiers.store'), [
            'name' => 'X',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertSessionHasErrors('email');
    });

    it('requires matching password confirmation', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('owner.cashiers.store'), [
            'name' => 'X',
            'email' => 'x@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ])->assertSessionHasErrors('password');
    });

    it('cashier cannot create cashiers', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)->post(route('owner.cashiers.store'), [
            'name' => 'X', 'email' => 'x@example.com',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ])->assertStatus(403);
    });
});

describe('Edit Cashier', function () {
    it('owner can update cashier name and email', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($owner)->put(route('owner.cashiers.update', $cashier), [
            'name' => 'Nama Baru',
            'email' => 'baru@example.com',
        ])->assertRedirect(route('owner.cashiers.index'));

        $cashier->refresh();
        expect($cashier->name)->toBe('Nama Baru');
        expect($cashier->email)->toBe('baru@example.com');
        expect($cashier->isCashier())->toBeTrue();
    });

    it('cannot manage a non-cashier account', function () {
        $owner = User::factory()->owner()->create();
        $anotherOwner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.cashiers.edit', $anotherOwner))
            ->assertStatus(404);
    });
});

describe('Activate / Deactivate Cashier', function () {
    it('owner can deactivate then activate a cashier', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($owner)->patch(route('owner.cashiers.toggle-status', $cashier))->assertRedirect();
        expect($cashier->refresh()->isActive())->toBeFalse();

        $this->actingAs($owner)->patch(route('owner.cashiers.toggle-status', $cashier))->assertRedirect();
        expect($cashier->refresh()->isActive())->toBeTrue();
    });
});

describe('Reset Cashier Password', function () {
    it('owner can reset a cashier password', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($owner)->put(route('owner.cashiers.reset-password', $cashier), [
            'password' => 'newsecret123',
            'password_confirmation' => 'newsecret123',
        ])->assertRedirect();

        expect(Hash::check('newsecret123', $cashier->refresh()->password))->toBeTrue();
    });

    it('reset requires confirmation', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($owner)->from(route('owner.cashiers.index'))
            ->put(route('owner.cashiers.reset-password', $cashier), [
                'password' => 'newsecret123',
                'password_confirmation' => 'nope',
            ])->assertSessionHasErrors('password');
    });
});

describe('Cashier Statistics', function () {
    it('list includes transaction count and total sales', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();
        Transaction::factory()->create(['cashier_id' => $cashier->id, 'total' => 50000]);
        Transaction::factory()->create(['cashier_id' => $cashier->id, 'total' => 30000]);

        $this->actingAs($owner)
            ->get(route('owner.cashiers.index'))
            ->assertInertia(fn ($page) => $page
                ->where('cashiers.data.0.transactions_count', 2)
                ->where('cashiers.data.0.transactions_sum_total', 80000)
            );
    });

    it('show page returns statistics', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();
        Transaction::factory()->create(['cashier_id' => $cashier->id, 'total' => 25000, 'created_at' => now()]);

        $this->actingAs($owner)
            ->get(route('owner.cashiers.show', $cashier))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Cashier/Show')
                ->where('stats.transactions_count', 1)
                ->where('stats.total_sales', 25000)
            );
    });
});
