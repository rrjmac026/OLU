<?php

namespace App\Models;

use App\Enums\Visibility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimelineMoment extends Model
{
    protected $fillable = ['title', 'story', 'moment_date', 'visibility'];

    protected function casts(): array
    {
        return [
            'moment_date' => 'date',
            'visibility' => Visibility::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** My own moments plus the other person's shared ones. */
    public function scopeVisibleTo(Builder $query, User $viewer): Builder
    {
        return $query->where(function ($w) use ($viewer) {
            $w->where('user_id', $viewer->id)
              ->orWhere(fn ($x) => $x->where('user_id', '!=', $viewer->id)->where('visibility', 'shared'));
        });
    }

    public function toPayload(User $viewer): array
    {
        $mine = $this->user_id === $viewer->id;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'story' => $this->story,
            'date' => $this->moment_date->toDateString(),
            'visibility' => $this->visibility->value,
            'mine' => $mine,
            'owner' => $mine ? null : ($this->user?->profile?->display_name ?: $this->user?->name),
        ];
    }
}