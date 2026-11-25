<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\LogsActivity;

class Background extends Model
{
    use LogsActivity; 

    protected string $activityLabel = 'a background';
    protected array $activityIgnore = ['opened_at']; // fields that shouldn't count as an update

    protected $fillable = ['user_id', 'path', 'mime', 'size', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}