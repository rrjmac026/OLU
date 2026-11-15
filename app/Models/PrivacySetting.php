<?php

namespace App\Models;

use App\Enums\Visibility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrivacySetting extends Model
{
    protected $fillable = [
        'user_id',
        'share_usage_summary',
        'default_entry_visibility',
    ];

    protected function casts(): array
    {
        return [
            'share_usage_summary' => 'boolean',
            'default_entry_visibility' => Visibility::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}