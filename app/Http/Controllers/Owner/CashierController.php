<?php

declare(strict_types=1);

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cashier\ResetCashierPasswordRequest;
use App\Http\Requests\Cashier\StoreCashierRequest;
use App\Http\Requests\Cashier\UpdateCashierRequest;
use App\Models\User;
use App\Services\CashierService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashierController extends Controller
{
    public function __construct(private readonly CashierService $cashierService) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Owner/Cashier/Index', [
            'cashiers' => $this->cashierService->getPaginated($search),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Owner/Cashier/Create');
    }

    public function store(StoreCashierRequest $request): RedirectResponse
    {
        $this->cashierService->create($request->validated());

        return redirect()->route('owner.cashiers.index')
            ->with('success', 'Kasir berhasil ditambahkan.');
    }

    public function show(User $cashier): Response
    {
        $this->ensureCashier($cashier);

        return Inertia::render('Owner/Cashier/Show', [
            'cashier' => [
                'id' => $cashier->id,
                'name' => $cashier->name,
                'email' => $cashier->email,
                'avatar_url' => $cashier->avatar_url,
                'status' => $cashier->status->value,
                'created_at' => $cashier->created_at->format('d M Y'),
            ],
            'stats' => $this->cashierService->statistics($cashier),
        ]);
    }

    public function edit(User $cashier): Response
    {
        $this->ensureCashier($cashier);

        return Inertia::render('Owner/Cashier/Edit', [
            'cashier' => [
                'id' => $cashier->id,
                'name' => $cashier->name,
                'email' => $cashier->email,
            ],
        ]);
    }

    public function update(UpdateCashierRequest $request, User $cashier): RedirectResponse
    {
        $this->ensureCashier($cashier);

        $this->cashierService->update($cashier, $request->validated());

        return redirect()->route('owner.cashiers.index')
            ->with('success', 'Data kasir berhasil diperbarui.');
    }

    public function toggleStatus(User $cashier): RedirectResponse
    {
        $this->ensureCashier($cashier);

        $cashier = $this->cashierService->toggleStatus($cashier);

        return back()->with(
            'success',
            $cashier->isActive() ? 'Kasir diaktifkan.' : 'Kasir dinonaktifkan.',
        );
    }

    public function resetPassword(ResetCashierPasswordRequest $request, User $cashier): RedirectResponse
    {
        $this->ensureCashier($cashier);

        $this->cashierService->resetPassword($cashier, $request->validated('password'));

        return back()->with('success', 'Password kasir berhasil direset.');
    }

    /**
     * Cashier-management routes operate on cashier accounts only.
     */
    private function ensureCashier(User $user): void
    {
        abort_unless($user->isCashier(), 404);
    }
}
