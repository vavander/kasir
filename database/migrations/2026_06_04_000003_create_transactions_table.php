<?php

declare(strict_types=1);

use App\Enums\PaymentMethod;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('cashier_id')->constrained('users')->restrictOnDelete();
            $table->string('payment_method')->default(PaymentMethod::Cash->value);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->timestamps();

            $table->index('invoice_number');
            $table->index('created_at');
            $table->index('cashier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
