<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\LogsActivity;

class Song extends Model
{
    use LogsActivity;

    protected string $activityLabel = 'a song';
    protected array $activityIgnore = ['opened_at']; // fields that shouldn't count as an update
    
    protected $fillable = ['user_id', 'title', 'artist', 'link', 'audio_path', 'note'];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}