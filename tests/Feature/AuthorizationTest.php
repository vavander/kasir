<?php

declare(strict_types=1);

use App\Models\User;

/**
 * Defense-in-depth: verify role boundaries across every GET route in the app.
 */

$ownerRoutes = [
    'owner.dashboard',
    'owner.menus.index',
    'owner.menus.create',
    'owner.transactions.index',
    'owner.expenses.index',
    'owner.reports.index',
    'owner.reports.export.pdf',
    'owner.reports.export.excel',
    'owner.cashiers.index',
    'owner.cashiers.create',
];

$cashierRoutes = [
    'cashier.dashboard',
    'cashier.pos',
    'cashier.transactions.index',
    'cashier.expenses.index',
];

describe('Owner-only routes', function () use ($ownerRoutes) {
    it('blocks cashier from owner route', function (string $name) {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)->get(route($name))->assertStatus(403);
    })->with($ownerRoutes);

    it('allows owner into owner route', function (string $name) {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->get(route($name))->assertSuccessful();
    })->with($ownerRoutes);

    it('redirects guest to login', function (string $name) {
        $this->get(route($name))->assertRedirect(route('login'));
    })->with($ownerRoutes);
});

describe('Cashier-only routes', function () use ($cashierRoutes) {
    it('blocks owner from cashier route', function (string $name) {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->get(route($name))->assertStatus(403);
    })->with($cashierRoutes);

    it('allows cashier into cashier route', function (string $name) {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)->get(route($name))->assertSuccessful();
    })->with($cashierRoutes);

    it('redirects guest to login', function (string $name) {
        $this->get(route($name))->assertRedirect(route('login'));
    })->with($cashierRoutes);
});

describe('Inactive users', function () {
    it('cannot access owner routes even with owner role', function () {
        $owner = User::factory()->owner()->inactive()->create();

        $this->actingAs($owner)->get(route('owner.dashboard'))
            ->assertRedirect(route('login'));
    });

    it('cannot access cashier routes even with cashier role', function () {
        $cashier = User::factory()->cashier()->inactive()->create();

        $this->actingAs($cashier)->get(route('cashier.pos'))
            ->assertRedirect(route('login'));
    });
});

describe('Shared authenticated routes', function () {
    it('owner can reach profile', function () {
        $owner = User::factory()->owner()->create();
        $this->actingAs($owner)->get(route('profile.edit'))->assertSuccessful();
    });

    it('cashier can reach profile', function () {
        $cashier = User::factory()->cashier()->create();
        $this->actingAs($cashier)->get(route('profile.edit'))->assertSuccessful();
    });

    it('guest cannot reach profile', function () {
        $this->get(route('profile.edit'))->assertRedirect(route('login'));
    });
});
