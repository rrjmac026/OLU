<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\LogsActivity;

class Album extends Model
{
    use LogsActivity;


    public const THEMES = ['night', 'rose', 'sunset', 'forest'];
    public const FILTERS = ['none', 'warm', 'cool', 'bw', 'dreamy'];
    public const TRANSITIONS = ['fade', 'slide', 'zoom'];
    public const POSITIONS = ['top', 'center', 'bottom'];

    protected string $activityLabel = 'an album';
    protected array $activityIgnore = ['opened_at']; // fields that shouldn't count as an update

   protected $fillable = [
        'user_id', 'title', 'description', 'theme',
        'default_song_id', 'default_song_start', 'default_song_end', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'default_song_start' => 'float',
            'default_song_end' => 'float',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function defaultSong(): BelongsTo
    {
        return $this->belongsTo(Song::class, 'default_song_id');
    }

    public function slides(): HasMany
    {
        return $this->hasMany(AlbumSlide::class)->orderBy('position');
    }

    /** Admin sees everything; everyone else only published albums. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $user->isAdmin() ? $query : $query->where('is_published', true);
    }

    public function canBeViewedBy(User $user): bool
    {
        return $user->isAdmin() || $this->is_published;
    }
}