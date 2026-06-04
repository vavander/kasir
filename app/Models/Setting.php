<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'store_name',
        'logo',
        'address',
        'phone',
    ];

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo) {
            return null;
        }

        return asset('storage/'.$this->logo);
    }

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'store_name' => 'My Restaurant',
            'logo' => null,
            'address' => 'Indonesia',
            'phone' => null,
        ]);
    }
}
