<?php

namespace App\Models;

use App\Enums\LetterKind;
use App\Enums\LetterOccasion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Letter extends Model
{
    protected $fillable = [
        'sender_id', 'recipient_id', 'kind', 'occasion',
        'title', 'body', 'unlock_at', 'opened_at',
    ];

    protected function casts(): array
    {
        return [
            'kind' => LetterKind::class,
            'occasion' => LetterOccasion::class,
            'unlock_at' => 'datetime',
            'opened_at' => 'datetime',
        ];
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /** Letters the user wrote or received. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $q) use ($user) {
            $q->where('sender_id', $user->id)->orWhere('recipient_id', $user->id);
        });
    }

    public function isLocked(): bool
    {
        return $this->unlock_at !== null && $this->unlock_at->isFuture();
    }

    public function isSender(User $user): bool
    {
        return $this->sender_id === $user->id;
    }

    public function isRecipient(User $user): bool
    {
        return $this->recipient_id === $user->id;
    }

    public function canBeViewedBy(User $user): bool
    {
        return $this->isSender($user) || $this->isRecipient($user);
    }
}