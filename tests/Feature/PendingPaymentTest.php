<?php

declare(strict_types=1);

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Transaction;
use App\Models\User;

describe('Pending Payments — Access & Scoping', function () {
    it('owner sees all unpaid transactions', function () {
        $owner = User::factory()->owner()->create();
        $c1 = User::factory()->cashier()->create();
        $c2 = User::factory()->cashier()->create();
        Transaction::factory()->unpaid()->create(['cashier_id' => $c1->id]);
        Transaction::factory()->unpaid()->create(['cashier_id' => $c2->id]);
        Transaction::factory()->create(['cashier_id' => $c1->id]); // paid, excluded

        $this->actingAs($owner)
            ->get(route('owner.pending.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Pending/Index')
                ->has('pending.data', 2)
                ->has('filters')
            );
    });

    it('cashier sees all unpaid transactions including other shifts', function () {
        $cashier = User::factory()->cashier()->create();
        $other = User::factory()->cashier()->create();
        Transaction::factory()->unpaid()->count(2)->create(['cashier_id' => $cashier->id]);
        Transaction::factory()->unpaid()->count(3)->create(['cashier_id' => $other->id]);
        Transaction::factory()->create(['cashier_id' => $other->id]); // paid — excluded

        $this->actingAs($cashier)
            ->get(route('cashier.pending.index'))
            ->assertInertia(fn ($page) => $page->has('pending.data', 5));
    });

    it('owner cannot access cashier pending and vice versa', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($owner)->get(route('cashier.pending.index'))->assertStatus(403);
        $this->actingAs($cashier)->get(route('owner.pending.index'))->assertStatus(403);
    });

    it('guest is redirected to login', function () {
        $this->get(route('owner.pending.index'))->assertRedirect(route('login'));
        $this->get(route('cashier.pending.index'))->assertRedirect(route('login'));
    });

    it('search filters pending by customer name', function () {
        $owner = User::factory()->owner()->create();
        $c = User::factory()->cashier()->create();
        Transaction::factory()->unpaid()->create(['cashier_id' => $c->id, 'customer_name' => 'Budi']);
        Transaction::factory()->unpaid()->create(['cashier_id' => $c->id, 'customer_name' => 'Siti']);

        $this->actingAs($owner)
            ->get(route('owner.pending.index', ['search' => 'Budi']))
            ->assertInertia(fn ($page) => $page->has('pending.data', 1));
    });
});

describe('Settle Payment', function () {
    it('cashier settles their own unpaid transaction', function () {
        $cashier = User::factory()->cashier()->create();
        $trx = Transaction::factory()->unpaid()->create(['cashier_id' => $cashier->id, 'total' => 25000]);

        $this->actingAs($cashier)->put(route('cashier.pending.settle', $trx), [
            'payment_method' => 'cash',
            'paid_amount' => 30000,
        ])->assertRedirect();

        $trx->refresh();
        expect($trx->payment_status)->toBe(PaymentStatus::Paid);
        expect($trx->payment_method)->toBe(PaymentMethod::Cash);
    });

    it('cashier can settle another cashier unpaid order (shift handover)', function () {
        $cashier = User::factory()->cashier()->create();
        $other = User::factory()->cashier()->create();
        $trx = Transaction::factory()->unpaid()->create(['cashier_id' => $other->id, 'total' => 30000]);

        $this->actingAs($cashier)->put(route('cashier.pending.settle', $trx), [
            'payment_method' => 'cash',
            'paid_amount' => 30000,
        ])->assertRedirect();

        expect($trx->refresh()->payment_status)->toBe(PaymentStatus::Paid);
    });

    it('owner can settle any unpaid transaction', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();
        $trx = Transaction::factory()->unpaid()->create(['cashier_id' => $cashier->id, 'total' => 10000]);

        $this->actingAs($owner)->put(route('owner.pending.settle', $trx), [
            'payment_method' => 'qris',
            'paid_amount' => 10000,
        ])->assertRedirect();

        expect($trx->refresh()->payment_status)->toBe(PaymentStatus::Paid);
    });

    it('cannot settle an already-paid transaction', function () {
        $owner = User::factory()->owner()->create();
        $trx = Transaction::factory()->create(); // paid by default

        $this->actingAs($owner)->put(route('owner.pending.settle', $trx), [
            'payment_method' => 'cash',
            'paid_amount' => 10000,
        ])->assertStatus(404);
    });

    it('owner can delete an unpaid order and its items', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();
        $trx = Transaction::factory()->unpaid()->create(['cashier_id' => $cashier->id]);
        \App\Models\TransactionItem::factory()->create(['transaction_id' => $trx->id]);

        $this->actingAs($owner)->delete(route('owner.pending.destroy', $trx))->assertRedirect();

        $this->assertDatabaseMissing('transactions', ['id' => $trx->id]);
        $this->assertDatabaseMissing('transaction_items', ['transaction_id' => $trx->id]);
    });

    it('owner cannot delete a paid transaction', function () {
        $owner = User::factory()->owner()->create();
        $trx = Transaction::factory()->create(); // paid

        $this->actingAs($owner)->delete(route('owner.pending.destroy', $trx))->assertStatus(404);
        $this->assertDatabaseHas('transactions', ['id' => $trx->id]);
    });

    it('cashier cannot delete a pending order', function () {
        $cashier = User::factory()->cashier()->create();
        $trx = Transaction::factory()->unpaid()->create(['cashier_id' => $cashier->id]);

        $this->actingAs($cashier)->delete(route('owner.pending.destroy', $trx))->assertStatus(403);
        $this->assertDatabaseHas('transactions', ['id' => $trx->id]);
    });

    it('settle requires a payment method', function () {
        $cashier = User::factory()->cashier()->create();
        $trx = Transaction::factory()->unpaid()->create(['cashier_id' => $cashier->id]);

        $this->actingAs($cashier)->from(route('cashier.pending.index'))
            ->put(route('cashier.pending.settle', $trx), ['paid_amount' => 10000])
            ->assertSessionHasErrors('payment_method');
    });
});

describe('Owner Dashboard — Pending Cards', function () {
    it('exposes pending count and value', function () {
        \Illuminate\Support\Facades\Cache::flush(); // dashboard payload is cached per day

        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();
        Transaction::factory()->unpaid()->create(['cashier_id' => $cashier->id, 'total' => 15000]);
        Transaction::factory()->unpaid()->create(['cashier_id' => $cashier->id, 'total' => 25000]);

        $this->actingAs($owner)
            ->get(route('owner.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('pending.count', 2)
                ->where('pending.value', 40000)
            );
    });
});

describe('Reports — Payment Status Visibility', function () {
    it('shows paid, unpaid and pending amounts', function () {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create();

        Transaction::factory()->create(['cashier_id' => $cashier->id, 'total' => 100000, 'created_at' => now()]); // paid
        Transaction::factory()->unpaid()->create(['cashier_id' => $cashier->id, 'total' => 40000, 'created_at' => now()]); // unpaid

        $this->actingAs($owner)
            ->get(route('owner.reports.index', ['mode' => 'daily', 'date' => now()->toDateString()]))
            ->assertInertia(fn ($page) => $page
                ->where('report.summary.paid_total', 100000)
                ->where('report.summary.unpaid_total', 40000)
                ->where('report.summary.pending_amount', 40000)
            );
    });
});
