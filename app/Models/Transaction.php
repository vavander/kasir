<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'cashier_id',
        'customer_name',
        'payment_method',
        'payment_status',
        'subtotal',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function getTotalHppAttribute(): float
    {
        return (float) $this->items->sum(fn ($item) => $item->hpp * $item->qty);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', PaymentStatus::Unpaid->value);
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', PaymentStatus::Paid->value);
    }

    public function scopeForCashier($query, int $cashierId)
    {
        return $query->where('cashier_id', $cashierId);
    }
}
