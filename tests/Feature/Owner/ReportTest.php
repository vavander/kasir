<?php

declare(strict_types=1);

use App\Models\Expense;
use App\Models\Menu;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Services\ReportService;
use Illuminate\Support\Carbon;

/**
 * Seed one transaction (with one item) and one expense on a given date.
 */
function seedDay(string $date, float $sellingPrice, float $hpp, int $qty, float $expense, ?User $cashier = null): void
{
    $cashier ??= User::factory()->cashier()->create();
    $menu = Menu::factory()->create(['hpp' => $hpp, 'selling_price' => $sellingPrice]);

    $transaction = Transaction::factory()->create([
        'cashier_id' => $cashier->id,
        'subtotal' => $sellingPrice * $qty,
        'total' => $sellingPrice * $qty,
        'created_at' => Carbon::parse($date)->setTime(12, 0),
    ]);

    TransactionItem::factory()->create([
        'transaction_id' => $transaction->id,
        'menu_id' => $menu->id,
        'menu_name' => $menu->name,
        'qty' => $qty,
        'hpp' => $hpp,
        'selling_price' => $sellingPrice,
        'subtotal' => $sellingPrice * $qty,
    ]);

    if ($expense > 0) {
        Expense::factory()->create([
            'user_id' => $cashier->id,
            'amount' => $expense,
            'expense_date' => $date,
        ]);
    }
}

describe('Report Page Access', function () {
    it('owner can view report index', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.reports.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Report/Index')
                ->has('report')
                ->has('report.summary')
                ->has('report.daily')
                ->has('filters')
                ->has('range')
            );
    });

    it('cashier cannot access reports', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('owner.reports.index'))
            ->assertStatus(403);
    });

    it('guest is redirected to login', function () {
        $this->get(route('owner.reports.index'))->assertRedirect(route('login'));
    });
});

describe('Report Filter Validation', function () {
    it('rejects invalid mode', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.reports.index', ['mode' => 'weekly']))
            ->assertSessionHasErrors('mode');
    });

    it('rejects end date before start date', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.reports.index', ['mode' => 'custom', 'start' => '2026-03-10', 'end' => '2026-03-01']))
            ->assertSessionHasErrors('end');
    });

    it('rejects malformed month', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('owner.reports.index', ['mode' => 'monthly', 'month' => '2026-13']))
            ->assertSessionHasErrors('month');
    });
});

describe('ReportService — Calculation', function () {
    it('returns zero summary when no data', function () {
        $service = app(ReportService::class);
        $report = $service->generate(today(), today());

        expect($report['summary']['omzet'])->toBe(0.0);
        expect($report['summary']['hpp'])->toBe(0.0);
        expect($report['summary']['pengeluaran'])->toBe(0.0);
        expect($report['summary']['laba_bersih'])->toBe(0.0);
    });

    it('computes omzet, hpp, pengeluaran and laba bersih for a day', function () {
        // Nasi Goreng: jual 18000, hpp 10000, 10 porsi, expense 20000
        seedDay('2026-03-15', 18000, 10000, 10, 20000);

        $service = app(ReportService::class);
        $report = $service->generate(Carbon::parse('2026-03-15'), Carbon::parse('2026-03-15'));

        expect($report['summary']['omzet'])->toBe(180000.0);
        expect($report['summary']['hpp'])->toBe(100000.0);
        expect($report['summary']['laba_kotor'])->toBe(80000.0);
        expect($report['summary']['pengeluaran'])->toBe(20000.0);
        expect($report['summary']['laba_bersih'])->toBe(60000.0); // 180000 - 100000 - 20000
    });

    it('excludes data outside the range', function () {
        seedDay('2026-03-15', 18000, 10000, 10, 20000);
        seedDay('2026-03-20', 50000, 30000, 5, 99000); // outside

        $service = app(ReportService::class);
        $report = $service->generate(Carbon::parse('2026-03-15'), Carbon::parse('2026-03-15'));

        expect($report['summary']['omzet'])->toBe(180000.0);
    });

    it('aggregates a custom multi-day range', function () {
        seedDay('2026-03-15', 18000, 10000, 10, 20000); // omzet 180000
        seedDay('2026-03-16', 10000, 4000, 2, 5000);    // omzet 20000

        $service = app(ReportService::class);
        $report = $service->generate(Carbon::parse('2026-03-15'), Carbon::parse('2026-03-16'));

        expect($report['summary']['omzet'])->toBe(200000.0);
        expect($report['daily'])->toHaveCount(2);
        expect($report['daily'][0]['omzet'])->toBe(180000.0);
        expect($report['daily'][1]['omzet'])->toBe(20000.0);
    });

    it('daily breakdown zero-fills days without data', function () {
        seedDay('2026-03-15', 18000, 10000, 1, 0);

        $service = app(ReportService::class);
        $report = $service->generate(Carbon::parse('2026-03-15'), Carbon::parse('2026-03-17'));

        expect($report['daily'])->toHaveCount(3);
        expect($report['daily'][1]['omzet'])->toBe(0.0);
        expect($report['daily'][2]['omzet'])->toBe(0.0);
    });

    it('laba bersih can be negative', function () {
        seedDay('2026-03-15', 10000, 8000, 1, 50000);

        $service = app(ReportService::class);
        $report = $service->generate(Carbon::parse('2026-03-15'), Carbon::parse('2026-03-15'));

        expect($report['summary']['laba_bersih'])->toBeLessThan(0);
    });
});

describe('ReportService — Range Resolution', function () {
    it('resolves a monthly range to full month', function () {
        $service = app(ReportService::class);
        $range = $service->resolveRange(['mode' => 'monthly', 'month' => '2026-02']);

        expect($range['start']->toDateString())->toBe('2026-02-01');
        expect($range['end']->toDateString())->toBe('2026-02-28');
        expect($range['mode'])->toBe('monthly');
    });

    it('resolves a daily range to a single day', function () {
        $service = app(ReportService::class);
        $range = $service->resolveRange(['mode' => 'daily', 'date' => '2026-03-15']);

        expect($range['start']->toDateString())->toBe('2026-03-15');
        expect($range['end']->toDateString())->toBe('2026-03-15');
    });

    it('resolves a custom range', function () {
        $service = app(ReportService::class);
        $range = $service->resolveRange(['mode' => 'custom', 'start' => '2026-03-01', 'end' => '2026-03-10']);

        expect($range['start']->toDateString())->toBe('2026-03-01');
        expect($range['end']->toDateString())->toBe('2026-03-10');
    });
});

describe('Report Export', function () {
    it('owner can export PDF', function () {
        $owner = User::factory()->owner()->create();
        seedDay('2026-03-15', 18000, 10000, 10, 20000);

        $response = $this->actingAs($owner)
            ->get(route('owner.reports.export.pdf', ['mode' => 'daily', 'date' => '2026-03-15']));

        $response->assertStatus(200);
        expect($response->headers->get('content-type'))->toContain('application/pdf');
    });

    it('owner can export Excel/CSV', function () {
        $owner = User::factory()->owner()->create();
        seedDay('2026-03-15', 18000, 10000, 10, 20000);

        $response = $this->actingAs($owner)
            ->get(route('owner.reports.export.excel', ['mode' => 'daily', 'date' => '2026-03-15']));

        $response->assertStatus(200);
        expect($response->headers->get('content-type'))->toContain('text/csv');
    });

    it('cashier cannot export reports', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('owner.reports.export.pdf'))
            ->assertStatus(403);

        $this->actingAs($cashier)
            ->get(route('owner.reports.export.excel'))
            ->assertStatus(403);
    });
});
