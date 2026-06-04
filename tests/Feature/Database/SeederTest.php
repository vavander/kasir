<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\OwnerSeeder;
use Database\Seeders\SettingSeeder;

describe('Database Seeders', function () {
    it('OwnerSeeder creates owner account', function () {
        $this->seed(OwnerSeeder::class);

        $owner = User::where('email', 'owner@example.com')->first();

        expect($owner)->not->toBeNull();
        expect($owner->name)->toBe('Owner');
        expect($owner->role)->toBe(UserRole::Owner);
        expect($owner->status)->toBe(UserStatus::Active);
    });

    it('OwnerSeeder is idempotent', function () {
        $this->seed(OwnerSeeder::class);
        $this->seed(OwnerSeeder::class);

        $count = User::where('email', 'owner@example.com')->count();

        expect($count)->toBe(1);
    });

    it('SettingSeeder creates store settings', function () {
        $this->seed(SettingSeeder::class);

        $setting = Setting::first();

        expect($setting)->not->toBeNull();
        expect($setting->store_name)->toBe('My Restaurant');
        expect($setting->address)->toBe('Indonesia');
    });

    it('SettingSeeder is idempotent', function () {
        $this->seed(SettingSeeder::class);
        $this->seed(SettingSeeder::class);

        $count = Setting::count();

        expect($count)->toBe(1);
    });

    it('DatabaseSeeder runs all required seeders', function () {
        $this->seed(DatabaseSeeder::class);

        expect(User::where('email', 'owner@example.com')->exists())->toBeTrue();
        expect(Setting::count())->toBe(1);
    });

    it('owner password is hashed correctly', function () {
        $this->seed(OwnerSeeder::class);

        $owner = User::where('email', 'owner@example.com')->first();

        expect(\Illuminate\Support\Facades\Hash::check('password', $owner->password))->toBeTrue();
    });
});
