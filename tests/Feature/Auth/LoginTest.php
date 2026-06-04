<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

describe('Login Page', function () {
    it('renders login page for guests', function () {
        $response = $this->get(route('login'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Auth/Login'));
    });

    it('redirects authenticated users away from login', function () {
        $user = User::factory()->owner()->create();

        $this->actingAs($user)
            ->get(route('login'))
            ->assertRedirect();
    });
});

describe('Owner Authentication', function () {
    it('owner can login with correct credentials', function () {
        $owner = User::factory()->owner()->create([
            'email' => 'owner@test.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'owner@test.com',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('owner.dashboard'));
        $this->assertAuthenticatedAs($owner);
    });

    it('owner last_login_at is updated on login', function () {
        $owner = User::factory()->owner()->create([
            'email' => 'owner@test.com',
            'password' => Hash::make('password'),
            'last_login_at' => null,
        ]);

        $this->post(route('login'), [
            'email' => 'owner@test.com',
            'password' => 'password',
        ]);

        expect($owner->fresh()->last_login_at)->not->toBeNull();
    });

    it('owner can access dashboard', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Owner/Dashboard'));
    });

    it('owner cannot access cashier pos', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('cashier.pos'))
            ->assertStatus(403);
    });
});

describe('Cashier Authentication', function () {
    it('cashier can login with correct credentials', function () {
        $cashier = User::factory()->cashier()->create([
            'email' => 'kasir@test.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'kasir@test.com',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('cashier.pos'));
        $this->assertAuthenticatedAs($cashier);
    });

    it('cashier can access pos page', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('cashier.pos'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Cashier/Pos'));
    });

    it('cashier cannot access owner dashboard', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('owner.dashboard'))
            ->assertStatus(403);
    });
});

describe('Login Validation', function () {
    it('inactive user cannot login', function () {
        User::factory()->inactive()->create([
            'email' => 'inactive@test.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'inactive@test.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    });

    it('wrong password fails', function () {
        User::factory()->create([
            'email' => 'user@test.com',
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'user@test.com',
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    });

    it('non-existent email fails', function () {
        $response = $this->post(route('login'), [
            'email' => 'nobody@test.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    });

    it('email is required', function () {
        $this->post(route('login'), ['password' => 'password'])
            ->assertSessionHasErrors('email');
    });

    it('password is required', function () {
        $this->post(route('login'), ['email' => 'test@test.com'])
            ->assertSessionHasErrors('password');
    });
});

describe('Logout', function () {
    it('authenticated user can logout', function () {
        $user = User::factory()->owner()->create();

        $this->actingAs($user)
            ->post(route('logout'))
            ->assertRedirect(route('login'));

        $this->assertGuest();
    });

    it('guest cannot access protected routes', function () {
        $this->get(route('owner.dashboard'))
            ->assertRedirect(route('login'));

        $this->get(route('cashier.pos'))
            ->assertRedirect(route('login'));
    });
});

describe('Active User Middleware', function () {
    it('active user can access protected routes', function () {
        $user = User::factory()->owner()->create(['status' => UserStatus::Active->value]);

        $this->actingAs($user)
            ->get(route('owner.dashboard'))
            ->assertStatus(200);
    });

    it('inactive user is logged out and redirected', function () {
        $user = User::factory()->inactive()->owner()->create();

        $this->actingAs($user)
            ->get(route('owner.dashboard'))
            ->assertRedirect(route('login'));

        $this->assertGuest();
    });
});
