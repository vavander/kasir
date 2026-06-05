<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    /**
     * Update the user's name, email, and avatar.
     */
    public function update(User $user, array $data, ?UploadedFile $avatar = null, bool $removeAvatar = false): User
    {
        if ($removeAvatar) {
            $this->deleteAvatar($user->avatar);
            $data['avatar'] = null;
        } elseif ($avatar) {
            $this->deleteAvatar($user->avatar);
            $data['avatar'] = $this->storeAvatar($avatar);
        }

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return $user->refresh();
    }

    private function storeAvatar(UploadedFile $avatar): string
    {
        return $avatar->store('avatars', 'public');
    }

    private function deleteAvatar(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
