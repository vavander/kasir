<?php

declare(strict_types=1);

namespace App\Enums;

enum ExpenseCategory: string
{
    case BahanBaku = 'Bahan Baku';
    case Gas = 'Gas';
    case Listrik = 'Listrik';
    case Transport = 'Transport';
    case Lainnya = 'Lainnya';

    public function label(): string
    {
        return $this->value;
    }
}
