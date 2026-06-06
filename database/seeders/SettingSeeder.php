<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::firstOrCreate(
            ['id' => 1],
            [
                'store_name' => 'Kedai Cappadocia',
                'logo' => null,
                'address' => 'Indonesia',
                'phone' => null,
            ]
        );
    }
}
