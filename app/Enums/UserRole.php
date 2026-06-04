<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Owner = 'owner';
    case Cashier = 'cashier';

    public function label(): string
    {
        return match($this) {
            UserRole::Owner => 'Owner',
            UserRole::Cashier => 'Kasir',
        };
    }
}
