<?php

namespace App\Models;

use App\Enums\BucketCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BucketItem extends Model
{
    protected $fillable = ['user_id', 'title', 'category', 'note', 'is_done', 'done_at'];

    protected function casts(): array
    {
        return [
            'category' => BucketCategory::class,
            'is_done' => 'boolean',
            'done_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}