<?php

declare(strict_types=1);

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Menu\StoreMenuRequest;
use App\Http\Requests\Menu\UpdateMenuRequest;
use App\Models\Menu;
use App\Services\MenuService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function __construct(private readonly MenuService $menuService) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Owner/Menu/Index', [
            'menus' => $this->menuService->getPaginated($search),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Owner/Menu/Create');
    }

    public function store(StoreMenuRequest $request): RedirectResponse
    {
        $this->menuService->create(
            $request->safe()->except('image'),
            $request->file('image'),
        );

        return redirect()->route('owner.menus.index')
            ->with('success', 'Menu berhasil ditambahkan.');
    }

    public function edit(Menu $menu): Response
    {
        return Inertia::render('Owner/Menu/Edit', [
            'menu' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'category' => $menu->category,
                'hpp' => (float) $menu->hpp,
                'selling_price' => (float) $menu->selling_price,
                'image_url' => $menu->image_url,
                'is_active' => $menu->is_active,
            ],
        ]);
    }

    public function update(UpdateMenuRequest $request, Menu $menu): RedirectResponse
    {
        $this->menuService->update(
            $menu,
            $request->safe()->except('image'),
            $request->file('image'),
        );

        return redirect()->route('owner.menus.index')
            ->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        $this->menuService->delete($menu);

        return redirect()->route('owner.menus.index')
            ->with('success', 'Menu berhasil dihapus.');
    }

    public function toggleStatus(Menu $menu): RedirectResponse
    {
        $this->menuService->toggleStatus($menu);

        return back()->with(
            'success',
            $menu->is_active ? 'Menu dinonaktifkan.' : 'Menu diaktifkan.',
        );
    }
}
