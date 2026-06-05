<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Menu;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class MenuService
{
    public function getPaginated(string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return Menu::query()
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, ?UploadedFile $image = null): Menu
    {
        $data['image'] = $image ? $this->storeImage($image) : null;
        $data['is_active'] = $data['is_active'] ?? true;

        return Menu::create($data);
    }

    public function update(Menu $menu, array $data, ?UploadedFile $image = null): Menu
    {
        if ($image) {
            $this->deleteImage($menu->image);
            $data['image'] = $this->storeImage($image);
        }

        $menu->update($data);

        return $menu->fresh();
    }

    public function delete(Menu $menu): void
    {
        $this->deleteImage($menu->image);
        $menu->delete();
    }

    public function toggleStatus(Menu $menu): Menu
    {
        $menu->update(['is_active' => ! $menu->is_active]);

        return $menu->fresh();
    }

    private function storeImage(UploadedFile $image): string
    {
        return $image->store('menus', 'public');
    }

    private function deleteImage(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
