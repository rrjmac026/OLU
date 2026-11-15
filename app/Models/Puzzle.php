<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Puzzle extends Model
{
    protected $fillable = ['question', 'answer', 'hint', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Same puzzle for everyone on the same date key. */
    public static function dailyPick(string $date): ?self
    {
        $ids = static::active()->orderBy('id')->pluck('id');

        if ($ids->isEmpty()) {
            return null;
        }

        $day = intdiv(strtotime($date.' UTC'), 86400);

        return static::find($ids[$day % $ids->count()]);
    }

    public static function normalize(string $text): string
    {
        return preg_replace('/[^\p{L}\p{N}]/u', '', mb_strtolower($text)) ?? '';
    }

    public function accepts(string $guess): bool
    {
        $guess = static::normalize($guess);

        if ($guess === '') {
            return false;
        }

        foreach (explode('|', $this->answer) as $option) {
            if (static::normalize($option) === $guess) {
                return true;
            }
        }

        return false;
    }

    /** The answer as shown to the player (first option). */
    public function displayAnswer(): string
    {
        return trim(explode('|', $this->answer)[0]);
    }
}