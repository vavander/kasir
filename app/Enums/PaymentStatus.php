<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case Paid = 'paid';

    public function label(): string
    {
        return match($this) {
            PaymentStatus::Unpaid => 'Belum Bayar',
            PaymentStatus::Paid => 'Lunas',
        };
    }
}
