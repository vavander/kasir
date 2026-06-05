<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

describe('Profile Page Access', function () {
    it('owner can view their profile page', function () {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->get(route('profile.edit'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Profile/Edit'));
    });

    it('cashier can view their profile page', function () {
        $cashier = User::factory()->cashier()->create();

        $this->actingAs($cashier)
            ->get(route('profile.edit'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Profile/Edit'));
    });

    it('guest is redirected to login', function () {
        $this->get(route('profile.edit'))->assertRedirect(route('login'));
    });
});

describe('Update Profile Information', function () {
    it('updates name and email', function () {
        $user = User::factory()->cashier()->create();

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'Nama Baru',
            'email' => 'baru@example.com',
        ])->assertRedirect(route('profile.edit'));

        $user->refresh();
        expect($user->name)->toBe('Nama Baru');
        expect($user->email)->toBe('baru@example.com');
        expect($user->email_verified_at)->toBeNull();
    });

    it('keeps email verification when email unchanged', function () {
        $user = User::factory()->owner()->create();

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'Ganti Nama',
            'email' => $user->email,
        ])->assertRedirect(route('profile.edit'));

        expect($user->refresh()->email_verified_at)->not->toBeNull();
    });

    it('requires name and email', function () {
        $user = User::factory()->create();

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => '',
            'email' => '',
        ])->assertSessionHasErrors(['name', 'email']);
    });

    it('rejects duplicate email from another user', function () {
        $other = User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->create();

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => 'taken@example.com',
        ])->assertSessionHasErrors('email');
    });
});

describe('Avatar Upload', function () {
    it('uploads an avatar', function () {
        Storage::fake('public');
        $user = User::factory()->cashier()->create();

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->create('me.jpg', 100, 'image/jpeg'),
        ])->assertRedirect(route('profile.edit'));

        $user->refresh();
        expect($user->avatar)->not->toBeNull();
        Storage::disk('public')->assertExists($user->avatar);
    });

    it('replaces and deletes the old avatar', function () {
        Storage::fake('public');
        $user = User::factory()->create();

        $old = UploadedFile::fake()->create('old.jpg', 100, 'image/jpeg')->store('avatars', 'public');
        $user->update(['avatar' => $old]);
        Storage::disk('public')->assertExists($old);

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->create('new.jpg', 100, 'image/jpeg'),
        ]);

        $user->refresh();
        expect($user->avatar)->not->toBe($old);
        Storage::disk('public')->assertMissing($old);
        Storage::disk('public')->assertExists($user->avatar);
    });

    it('removes the avatar when requested', function () {
        Storage::fake('public');
        $user = User::factory()->create();

        $path = UploadedFile::fake()->create('me.jpg', 100, 'image/jpeg')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'remove_avatar' => true,
        ]);

        expect($user->refresh()->avatar)->toBeNull();
        Storage::disk('public')->assertMissing($path);
    });

    it('rejects non-image files', function () {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
        ])->assertSessionHasErrors('avatar');
    });

    it('rejects avatars larger than 5MB', function () {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->create('big.jpg', 6000, 'image/jpeg'),
        ])->assertSessionHasErrors('avatar');
    });

    it('exposes avatar_url accessor', function () {
        $user = User::factory()->create(['avatar' => 'avatars/test.jpg']);
        expect($user->avatar_url)->toContain('avatars/test.jpg');

        $noAvatar = User::factory()->create(['avatar' => null]);
        expect($noAvatar->avatar_url)->toBeNull();
    });
});

describe('Change Password', function () {
    it('updates the password with correct current password', function () {
        $user = User::factory()->create(); // factory password = 'password'

        $this->actingAs($user)->from(route('profile.edit'))->put(route('password.update'), [
            'current_password' => 'password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertSessionHasNoErrors();

        expect(\Illuminate\Support\Facades\Hash::check('new-password-123', $user->refresh()->password))->toBeTrue();
    });

    it('rejects an incorrect current password', function () {
        $user = User::factory()->create();

        $this->actingAs($user)->from(route('profile.edit'))->put(route('password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertSessionHasErrors('current_password');
    });

    it('requires password confirmation to match', function () {
        $user = User::factory()->create();

        $this->actingAs($user)->from(route('profile.edit'))->put(route('password.update'), [
            'current_password' => 'password',
            'password' => 'new-password-123',
            'password_confirmation' => 'different',
        ])->assertSessionHasErrors('password');
    });
});
