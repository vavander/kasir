<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;

class AuthService
{
    public function updateLastLogin(User $user): void
    {
        $user->forceFill(['last_login_at' => now()])->save();
    }

    public function getRedirectRoute(User $user): string
    {
        return match($user->role) {
            UserRole::Owner => route('owner.dashboard', absolute: false),
            UserRole::Cashier => route('cashier.pos', absolute: false),
        };
    }
}
