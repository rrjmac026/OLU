<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class MemoryMatchGame extends Model
{
    protected $fillable = [
        'user_a_id', 'user_b_id', 'deck', 'matched', 'flipped', 'status',
    ];

    public const SYMBOLS = ['🌸', '🌙', '⭐', '🍓', '🦋', '🎧', '🐱', '☕'];

    protected function casts(): array
    {
        return [
            'deck' => 'array',
            'matched' => 'array',
            'flipped' => 'array',
        ];
    }

    /** Only games the user plays in. Non-players get a 404 via firstOrFail. */
    public function scopeInvolving(Builder $query, User $user): Builder
    {
        return $query->where(function ($w) use ($user) {
            $w->where('user_a_id', $user->id)->orWhere('user_b_id', $user->id);
        });
    }

    /** A fresh shuffled deck: every symbol twice. */
    public static function newDeck(): array
    {
        return collect(self::SYMBOLS)
            ->merge(self::SYMBOLS)
            ->shuffle()
            ->values()
            ->all();
    }
}