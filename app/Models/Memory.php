<?php

namespace App\Models;

use App\Enums\Visibility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Memory extends Model
{
    protected $fillable = ['user_id', 'timeline_moment_id', 'caption', 'taken_on', 'visibility'];

    protected function casts(): array
    {
        return [
            'taken_on' => 'date',
            'visibility' => Visibility::class,
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MemoryPhoto::class)->orderBy('id');
    }

    public function moment(): BelongsTo
    {
        return $this->belongsTo(TimelineMoment::class, 'timeline_moment_id');
    }

    /** My memories, plus the other person's shared ones. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('visibility', Visibility::Shared->value);
        });
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function canBeViewedBy(User $user): bool
    {
        return $this->isOwnedBy($user) || $this->visibility === Visibility::Shared;
    }
}