<?php

declare(strict_types=1);

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
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
                ->has('categories')
                ->has('openTabs')
            );
    });

    it('owner cannot access POS page', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->get(route('cashier.pos'))->assertStatus(403);
    });
});

describe('Checkout — Paid Now', function () {
    it('creates a paid transaction', function () {
        $cashier = User::factory()->cashier()->create();
        $menu1 = Menu::factory()->create(['selling_price' => 15000, 'hpp' => 8000]);
        $menu2 = Menu::factory()->create(['selling_price' => 10000, 'hpp' => 5000]);

        $response = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [
                ['menu_id' => $menu1->id, 'qty' => 2],
                ['menu_id' => $menu2->id, 'qty' => 1],
            ],
            'customer_name' => 'Budi',
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount' => 50000,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['transaction' => ['id', 'invoice_number', 'customer_name', 'payment_status', 'total', 'items']]);

        $this->assertDatabaseHas('transactions', [
            'cashier_id' => $cashier->id,
            'customer_name' => 'Budi',
            'payment_method' => PaymentMethod::Cash->value,
            'payment_status' => PaymentStatus::Paid->value,
            'total' => 40000,
        ]);
    });

    it('calculates total correctly', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 18000]);

        $response = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 3]],
            'customer_name' => 'Meja 1',
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount' => 60000,
        ]);

        expect((float) $response->json('transaction.total'))->toBe(54000.0);
    });

    it('snapshots menu name and price', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['name' => 'Nasi Goreng Original', 'selling_price' => 15000, 'hpp' => 8000]);

        $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'customer_name' => 'Pak Andi',
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount' => 15000,
        ]);

        $this->assertDatabaseHas('transaction_items', [
            'menu_id' => $menu->id,
            'menu_name' => 'Nasi Goreng Original',
            'qty' => 1,
            'selling_price' => 15000,
            'hpp' => 8000,
        ]);
    });

    it('works with all payment methods', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 10000]);

        foreach (['cash', 'qris', 'transfer'] as $method) {
            $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
                'items' => [['menu_id' => $menu->id, 'qty' => 1]],
                'customer_name' => 'Bu Siti',
                'payment_status' => 'paid',
                'payment_method' => $method,
                'paid_amount' => 10000,
            ])->assertStatus(201);
        }

        $this->assertDatabaseCount('transactions', 3);
    });
});

describe('Checkout — Pay Later', function () {
    it('creates an unpaid transaction without payment method or amount', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 20000]);

        $response = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 2]],
            'customer_name' => 'Meja 5',
            'payment_status' => 'unpaid',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('transactions', [
            'customer_name' => 'Meja 5',
            'payment_status' => PaymentStatus::Unpaid->value,
            'payment_method' => null,
            'total' => 40000,
        ]);
    });

    it('merges a new pay-later order into the same customer open tab', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 10000]);

        // First pay-later order for Budi
        $first = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'customer_name' => 'Budi',
            'payment_status' => 'unpaid',
        ])->json('transaction.id');

        // Second pay-later order for the same customer
        $second = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 2]],
            'customer_name' => 'budi', // case-insensitive match
            'payment_status' => 'unpaid',
        ])->json('transaction.id');

        expect($second)->toBe($first);
        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseCount('transaction_items', 2);
        $this->assertDatabaseHas('transactions', ['id' => $first, 'total' => 30000]);
    });

    it('does not merge a pay-now order into an open tab', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 10000]);
        $tab = Transaction::factory()->unpaid()->create(['cashier_id' => $cashier->id, 'customer_name' => 'Budi', 'total' => 10000]);

        $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'customer_name' => 'Budi',
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount' => 10000,
        ])->assertStatus(201);

        $this->assertDatabaseCount('transactions', 2); // separate paid transaction
        expect($tab->refresh()->payment_status)->toBe(PaymentStatus::Unpaid);
    });

    it('keeps separate tabs for different customers', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 10000]);

        foreach (['Budi', 'Siti'] as $name) {
            $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
                'items' => [['menu_id' => $menu->id, 'qty' => 1]],
                'customer_name' => $name,
                'payment_status' => 'unpaid',
            ]);
        }

        $this->assertDatabaseCount('transactions', 2);
    });
});

describe('Checkout — Validation', function () {
    it('requires a customer name', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create();

        $res = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'payment_status' => 'unpaid',
        ]);
        expect($res->status())->toBe(422);
        expect($res->json('errors'))->toHaveKey('customer_name');
    });

    it('rejects a customer name shorter than 2 characters', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create();

        $res = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'customer_name' => 'A',
            'payment_status' => 'unpaid',
        ]);
        expect($res->status())->toBe(422);
        expect($res->json('errors'))->toHaveKey('customer_name');
    });

    it('rejects a customer name longer than 100 characters', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create();

        $res = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'customer_name' => str_repeat('x', 101),
            'payment_status' => 'unpaid',
        ]);
        expect($res->status())->toBe(422);
        expect($res->json('errors'))->toHaveKey('customer_name');
    });

    it('requires payment method when paying now', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create();

        $res = $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'customer_name' => 'Budi',
            'payment_status' => 'paid',
        ]);
        expect($res->status())->toBe(422);
        expect($res->json('errors'))->toHaveKey('payment_method');
    });

    it('does not create a transaction for an empty cart', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
            'items' => [],
            'customer_name' => 'Budi',
            'payment_status' => 'unpaid',
        ]);

        $this->assertDatabaseCount('transactions', 0);
    });

    it('owner cannot checkout', function () {
        $owner = User::factory()->owner()->create();
        $menu = Menu::factory()->create();

        $this->actingAs($owner)->postJson(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'customer_name' => 'Budi',
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount' => 10000,
        ])->assertStatus(403);
    });

    it('guest is redirected to login', function () {
        $menu = Menu::factory()->create();

        $this->post(route('cashier.pos.checkout'), [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'customer_name' => 'Budi',
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount' => 10000,
        ])->assertRedirect(route('login'));
    });
});

describe('Invoice Service', function () {
    it('generates invoice with correct format', function () {
        $invoice = app(InvoiceService::class)->generate();

        expect($invoice)->toMatch('/^INV-\d{8}-\d{4}$/');
        expect($invoice)->toStartWith('INV-'.now()->format('Ymd'));
    });

    it('generates sequential, unique invoices', function () {
        $cashier = User::factory()->cashier()->create();
        $menu = Menu::factory()->create(['selling_price' => 10000]);

        for ($i = 0; $i < 3; $i++) {
            $this->actingAs($cashier)->postJson(route('cashier.pos.checkout'), [
                'items' => [['menu_id' => $menu->id, 'qty' => 1]],
                'customer_name' => 'Budi',
                'payment_status' => 'paid',
                'payment_method' => 'cash',
                'paid_amount' => 10000,
            ]);
        }

        expect(Transaction::pluck('invoice_number')->unique())->toHaveCount(3);
    });
});
