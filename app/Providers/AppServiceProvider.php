<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // When an already-authenticated user hits a guest page (e.g. "/" or "/login"),
        // send them to the home that matches their role instead of a hardcoded
        // owner-only /dashboard (which 403s for cashiers).
        RedirectIfAuthenticated::redirectUsing(function (Request $request) {
            $user = $request->user();

            return $user && $user->isCashier()
                ? route('cashier.pos')
                : route('owner.dashboard');
        });
    }
}
