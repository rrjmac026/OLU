<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GardenWallet extends Model
{
    protected $fillable = ['user_id', 'spent'];

    protected $attributes = [
        'spent' => 0,
    ];

    protected function casts(): array
    {
        return ['spent' => 'integer'];
    }
}