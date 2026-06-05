<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function __construct(private readonly ExpenseService $expenseService) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Cashier/Expense/Index', [
            'expenses' => $this->expenseService->getPaginatedForUser(Auth::id(), $search),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $this->expenseService->create(Auth::user(), $request->validated());

        return back()->with('success', 'Pengeluaran berhasil dicatat.');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        if ($expense->user_id !== Auth::id()) {
            abort(403);
        }

        $this->expenseService->update($expense, $request->validated());

        return back()->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        if ($expense->user_id !== Auth::id()) {
            abort(403);
        }

        $this->expenseService->delete($expense);

        return back()->with('success', 'Pengeluaran berhasil dihapus.');
    }
}
