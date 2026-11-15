<?php

namespace App\Models;

use App\Enums\WheelCategory;
use Illuminate\Database\Eloquent\Model;

class WheelItem extends Model
{
    protected $fillable = ['category', 'label', 'is_active'];

    protected function casts(): array
    {
        return [
            'category' => WheelCategory::class,
            'is_active' => 'boolean',
        ];
    }
}