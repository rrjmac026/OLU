<?php

namespace App\Models;

use App\Enums\Mood;
use App\Enums\Visibility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyCheckin extends Model
{
    protected $fillable = [
        'user_id',
        'checkin_date',
        'mood',
        'note',
        'visibility',
    ];

    protected function casts(): array
    {
        return [
            'checkin_date' => 'date',
            'mood' => Mood::class,
            'visibility' => Visibility::class,
        ];
    }

    /**
     * Always query through this scope so a user only ever touches their own rows.
     */
    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    /**
     * "Today" in the user's own timezone, as Y-m-d.
     */
    public static function todayFor(User $user): string
    {
        return now($user->profile?->timezone ?? 'UTC')->toDateString();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}