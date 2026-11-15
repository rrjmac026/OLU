<?php

namespace App\Models;

use App\Enums\ContentKind;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ContentItem extends Model
{
    protected $fillable = ['kind', 'body', 'is_active'];

    protected function casts(): array
    {
        return [
            'kind' => ContentKind::class,
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOfKind(Builder $query, ContentKind $kind): Builder
    {
        return $query->where('kind', $kind->value);
    }

    /** Same pick all day (per her timezone), changes the next day. */
    public static function dailyPick(ContentKind $kind, string $today): ?string
    {
        $bodies = static::active()->ofKind($kind)->orderBy('id')->pluck('body');

        if ($bodies->isEmpty()) {
            return null;
        }

        return $bodies[crc32($kind->value . $today) % $bodies->count()];
    }

    /** A random active one, avoiding the one she already sees when there is a choice. */
    public static function randomBody(ContentKind $kind, ?string $exclude = null): ?string
    {
        $query = static::active()->ofKind($kind);

        if ($exclude !== null) {
            $query->where('body', '!=', $exclude);
        }

        return $query->inRandomOrder()->value('body')
            ?? static::active()->ofKind($kind)->value('body');
    }
}