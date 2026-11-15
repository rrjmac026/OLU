<?php

namespace App\Models;

use App\Enums\JournalType;
use App\Enums\Visibility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalEntry extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'entry_date',
        'visibility',
    ];

    protected function casts(): array
    {
        return [
            'type' => JournalType::class,
            'visibility' => Visibility::class,
            'entry_date' => 'date',
        ];
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    /**
     * Entries written by someone else that they chose to share.
     */
    public function scopeSharedWith(Builder $query, User $viewer): Builder
    {
        return $query
            ->where('visibility', Visibility::Shared->value)
            ->where('user_id', '!=', $viewer->id);
    }

    public function canBeViewedBy(User $user): bool
    {
        return $this->user_id === $user->id || $this->visibility === Visibility::Shared;
    }

    public static function todayFor(User $user): string
    {
        return now($user->profile?->timezone ?? 'UTC')->toDateString();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}