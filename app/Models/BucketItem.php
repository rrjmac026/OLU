<?php

namespace App\Models;

use App\Enums\BucketCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\LogsActivity;

class BucketItem extends Model
{
    use LogsActivity; 

    protected string $activityLabel = 'a bucket item';
    protected array $activityIgnore = ['opened_at']; // fields that shouldn't count as an update

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