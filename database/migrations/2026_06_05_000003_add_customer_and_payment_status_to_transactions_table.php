<?php

declare(strict_types=1);

use App\Enums\PaymentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('cashier_id');
            $table->string('payment_status')->default(PaymentStatus::Unpaid->value)->after('payment_method');
            $table->string('payment_method')->nullable()->change();
            $table->index('payment_status');
        });

        // Existing transactions were completed with a payment method → mark them paid.
        DB::table('transactions')->whereNotNull('payment_method')->update([
            'payment_status' => PaymentStatus::Paid->value,
        ]);
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['payment_status']);
            $table->dropColumn(['customer_name', 'payment_status']);
            $table->string('payment_method')->nullable(false)->change();
        });
    }
};
