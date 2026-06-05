<?php

declare(strict_types=1);

use App\Enums\PaymentMethod;
use App\Models\Menu;
use App\Models\Transaction;
use App\Models\User;
use App\Services\InvoiceService;

describe('POS Page', function () {
    it('cashier can access POS page with active menus', function () {
        $cashier = User::factory()->cashier()->create();
        Menu::factory()->create(['is_active' => true]);
        Menu::factory()->inactive()->create();

        $this->actingAs($cashier)
            ->get(route('cashier.pos'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Cashier/Pos')
                ->has('menus', 1)
            );
    });

    it('owner cannot access POS page', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('cashier.pos'))
            ->assertStatus(403);
    });
});

describe('Checkout', function () {
    it('cashier can checkout and transaction is created', function () {
        $cashier = User::factory()->cashier()->create();
        $menu1 = Menu::factory()->create(['selling_price' => 15000, 'hpp' => 8000]);
        $menu2 = Menu::factory()->create(['selling_price' => 10000, 'hpp' => 5000]);

        $response = $this->actingAs($cashier)
            ->postJson(route('cashier.pos.checkout'), [
                'items' => [
                    ['menu_id' => $menu1->id, 'qty' => 2],
                    ['menu_id' => $menu2->id, 'qty' => 1],
                ],
                'payment_method' => 'cash',
                'paid_amount' => 50000,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'transaction' => [
                    'id', 'invoice_number', 'payment_method', 'total', 'items',
                ],
            ]);

        $this->assertDatabaseHas('transactions', [
            'cashier_id' => $cashier->id,
            'payment_method' => PaymentMethod::Cash->value,
            'total' => 40000,
        ]);

        $this->assertDatabaseCount('transaction_items', 2);
    });

    it('checkout calculates total correctly', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 18000]);

        $response = $this->actingAs($cashier)
            ->postJson(route('cashier.pos.checkout'), [
                'items' => [['menu_id' => $menu->id, 'qty' => 3]],
                'payment_method' => 'cash',
                'paid_amount' => 60000,
            ]);

        $response->assertStatus(201);
        $data = $response->json('transaction');
        expect((float) $data['total'])->toBe(54000.0);
    });

    it('transaction item snapshots menu name and price at time of sale', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create([
            'name' => 'Nasi Goreng Original',
            'selling_price' => 15000,
            'hpp' => 8000,
        ]);

        $this->actingAs($cashier)
            ->postJson(route('cashier.pos.checkout'), [
                'items' => [['menu_id' => $menu->id, 'qty' => 1]],
                'payment_method' => 'cash',
                'paid_amount' => 15000,
            ]);

        $this->assertDatabaseHas('transaction_items', [
            'menu_id' => $menu->id,
            'menu_name' => 'Nasi Goreng Original',
            'qty' => 1,
            'selling_price' => 15000,
            'hpp' => 8000,
            'subtotal' => 15000,
        ]);
    });

    it('checkout works with all payment methods', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 10000]);

        foreach (['cash', 'qris', 'transfer'] as $method) {
            $this->actingAs($cashier)
                ->postJson(route('cashier.pos.checkout'), [
                    'items' => [['menu_id' => $menu->id, 'qty' => 1]],
                    'payment_method' => $method,
                    'paid_amount' => 10000,
                ])
                ->assertStatus(201);
        }

        $this->assertDatabaseCount('transactions', 3);
    });

    it('empty cart does not create any transaction', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [],
            'payment_method' => 'cash',
            'paid_amount' => 0,
        ]);

        $this->assertDatabaseCount('transactions', 0);
    });

    it('invalid menu id does not create any transaction', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => 9999, 'qty' => 1]],
            'payment_method' => 'cash',
            'paid_amount' => 10000,
        ]);

        $this->assertDatabaseCount('transactions', 0);
    });

    it('invalid payment method does not create any transaction', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create();

        $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'payment_method' => 'bitcoin',
            'paid_amount' => 10000,
        ]);

        $this->assertDatabaseCount('transactions', 0);
    });

    it('owner cannot checkout', function () {
        $owner = User::factory()->owner()->create();
        $menu = Menu::factory()->create();

        $this->actingAs($owner)
            ->postJson(route('cashier.pos.checkout'), [
                'items' => [['menu_id' => $menu->id, 'qty' => 1]],
                'payment_method' => 'cash',
                'paid_amount' => 10000,
            ])
            ->assertStatus(403);
    });

    it('guest is redirected to login when attempting checkout', function () {
        $menu = Menu::factory()->create();

        $this->post(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'payment_method' => 'cash',
            'paid_amount' => 10000,
        ])->assertRedirect(route('login'));
    });
});

describe('Invoice Service', function () {
    it('generates invoice with correct format', function () {
        $service = app(InvoiceService::class);
        $invoice = $service->generate();

        expect($invoice)->toMatch('/^INV-\d{8}-\d{4}$/');
        expect($invoice)->toStartWith('INV-'.now()->format('Ymd'));
    });

    it('generates sequential invoices for the same day', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 10000]);

        $res1 = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'payment_method' => 'cash', 'paid_amount' => 10000,
        ]);
        $res2 = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'payment_method' => 'cash', 'paid_amount' => 10000,
        ]);

        $inv1 = $res1->json('transaction.invoice_number');
        $inv2 = $res2->json('transaction.invoice_number');

        $seq1 = (int) substr($inv1, -4);
        $seq2 = (int) substr($inv2, -4);

        expect($seq2)->toBe($seq1 + 1);
    });

    it('invoice numbers are unique', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 10000]);

        // Create 3 transactions
        for ($i = 0; $i < 3; $i++) {
            $this->actingAs($cashier)
                ->postJson(route('cashier.pos.checkout'), [
                    'items' => [['menu_id' => $menu->id, 'qty' => 1]],
                    'payment_method' => 'cash',
                    'paid_amount' => 10000,
                ]);
        }

        $invoices = Transaction::pluck('invoice_number')->toArray();
        expect(array_unique($invoices))->toHaveCount(3);
    });
});
