<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;

describe('User Model', function () {
    it('has correct fillable fields', function () {
        $user = new User();

        expect($user->getFillable())->toContain('name', 'email', 'password', 'role', 'status', 'last_login_at');
    });

    it('casts role to UserRole enum', function () {
        $user = User::factory()->owner()->create();

        expect($user->role)->toBeInstanceOf(UserRole::class);
        expect($user->role)->toBe(UserRole::Owner);
    });

    it('casts status to UserStatus enum', function () {
        $user = User::factory()->create();

        expect($user->status)->toBeInstanceOf(UserStatus::class);
        expect($user->status)->toBe(UserStatus::Active);
    });

    it('isOwner returns true for owner role', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();

        expect($owner->isOwner())->toBeTrue();
        expect($cashier->isOwner())->toBeFalse();
    });

    it('isCashier returns true for cashier role', function () {
        $cashier = User::factory()->cashier()->create();
        $owner = User::factory()->owner()->create();

        expect($cashier->isCashier())->toBeTrue();
        expect($owner->isCashier())->toBeFalse();
    });

    it('isActive returns true for active user', function () {
        $active = User::factory()->create();
        $inactive = User::factory()->inactive()->create();

        expect($active->isActive())->toBeTrue();
        expect($inactive->isActive())->toBeFalse();
    });

    it('has transactions relationship', function () {
        $user = User::factory()->cashier()->create();

        expect($user->transactions())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
    });

    it('has expenses relationship', function () {
        $user = User::factory()->create();

        expect($user->expenses())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
    });

    it('scope active returns only active users', function () {
        User::factory()->count(2)->create();
        User::factory()->inactive()->count(3)->create();

        $active = User::active()->get();

        expect($active)->each(fn ($u) => $u->status->toBe(UserStatus::Active));
    });

    it('scope owners returns only owner users', function () {
        User::factory()->owner()->count(2)->create();
        User::factory()->cashier()->count(3)->create();

        $owners = User::owners()->get();

        expect($owners)->each(fn ($u) => $u->role->toBe(UserRole::Owner));
    });
});
