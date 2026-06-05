<?php

declare(strict_types=1);

use App\Models\User;

/**
 * The branded Inertia error page is only rendered outside local/testing,
 * so each test flips the app environment to production first.
 */
describe('Branded error pages', function () {
    beforeEach(function () {
        $this->app['env'] = 'production';
    });

    it('renders an Inertia error page for 404', function () {
        $this->get('/halaman-yang-tidak-ada')
            ->assertStatus(404)
            ->assertInertia(fn ($page) => $page
                ->component('Error')
                ->where('status', 404)
            );
    });

    it('renders an Inertia error page for 403', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('owner.dashboard'))
            ->assertStatus(403)
            ->assertInertia(fn ($page) => $page
                ->component('Error')
                ->where('status', 403)
            );
    });
});

describe('Default (testing) error handling', function () {
    it('does not use the Inertia error page in the testing environment', function () {
        $cashier = User::factory()->cashier()->create();

        // In the testing env the raw 403 is returned (status only), not the Inertia page.
        $this->actingAs($cashier)
            ->get(route('owner.dashboard'))
            ->assertStatus(403);
    });
});
