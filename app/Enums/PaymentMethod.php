<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case Qris = 'qris';
    case Transfer = 'transfer';

    public function label(): string
    {
        return match($this) {
            PaymentMethod::Cash => 'Tunai',
            PaymentMethod::Qris => 'QRIS',
            PaymentMethod::Transfer => 'Transfer Bank',
        };
    }
}
