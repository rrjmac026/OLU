<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['sender_id', 'recipient_id', 'body'];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'edited_at' => 'datetime',
            'unsent_at' => 'datetime',
            'sender_removed_at' => 'datetime',
            'recipient_removed_at' => 'datetime',
        ];
    }

    /** One private channel per pair, always low id first. */
    public static function channelFor(int $a, int $b): string
    {
        return 'chat.' . min($a, $b) . '.' . max($a, $b);
    }

    public function scopeBetween(Builder $query, int $a, int $b): Builder
    {
        return $query->where(function ($w) use ($a, $b) {
            $w->where(fn ($x) => $x->where('sender_id', $a)->where('recipient_id', $b))
              ->orWhere(fn ($x) => $x->where('sender_id', $b)->where('recipient_id', $a));
        });
    }

    /** Hides messages this user removed from their own view. */
    public function scopeVisibleTo(Builder $query, int $userId): Builder
    {
        return $query->where(function ($w) use ($userId) {
            $w->where(fn ($x) => $x->where('sender_id', $userId)->whereNull('sender_removed_at'))
              ->orWhere(fn ($x) => $x->where('recipient_id', $userId)->whereNull('recipient_removed_at'));
        });
    }

    public function toPayload(): array
    {
        $unsent = $this->unsent_at !== null;

        return [
            'id' => $this->id,
            'sender_id' => $this->sender_id,
            'body' => $unsent ? '' : $this->body,
            'unsent' => $unsent,
            'edited' => $this->edited_at !== null,
            'created_at' => $this->created_at?->toIso8601String(),
            'read_at' => $this->read_at?->toIso8601String(),
        ];
    }
}