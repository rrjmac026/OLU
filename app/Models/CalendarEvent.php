<?php

namespace App\Models;

use App\Enums\EventType;
use App\Enums\Visibility;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarEvent extends Model
{
    protected $fillable = [
        'title', 'notes', 'event_date', 'event_time', 'type', 'repeats_yearly', 'visibility',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'repeats_yearly' => 'boolean',
            'type' => EventType::class,
            'visibility' => Visibility::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** My own events plus the other person's shared ones. */
    public function scopeVisibleTo(Builder $query, User $viewer): Builder
    {
        return $query->where(function ($w) use ($viewer) {
            $w->where('user_id', $viewer->id)
              ->orWhere(fn ($x) => $x->where('user_id', '!=', $viewer->id)->where('visibility', 'shared'));
        });
    }

    /** Date (Y-m-d) of this event in a given year. Feb 29 falls back to Feb 28 in non-leap years. */
    public function occurrenceDate(int $year): string
    {
        $month = $this->event_date->month;
        $day = min($this->event_date->day, Carbon::create($year, $month, 1)->daysInMonth);

        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    /** The date this event lands on in the given month, or null if it doesn't. */
    public function occurrenceInMonth(int $year, int $month): ?string
    {
        $d = $this->event_date;

        if ($this->repeats_yearly) {
            return ($d->month === $month && $d->year <= $year) ? $this->occurrenceDate($year) : null;
        }

        return ($d->year === $year && $d->month === $month) ? $d->toDateString() : null;
    }

    /** Next date (Y-m-d) on or after $today, or null for one-off events already past. */
    public function nextOccurrence(string $today): ?string
    {
        $start = $this->event_date->toDateString();

        if (! $this->repeats_yearly) {
            return $start >= $today ? $start : null;
        }

        $year = max((int) substr($today, 0, 4), $this->event_date->year);

        for ($y = $year; $y <= $year + 1; $y++) {
            $occ = $this->occurrenceDate($y);
            if ($occ >= $today && $occ >= $start) {
                return $occ;
            }
        }

        return null;
    }

    public function toPayload(User $viewer, ?string $date = null): array
    {
        $mine = $this->user_id === $viewer->id;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'notes' => $this->notes,
            'date' => $date ?? $this->event_date->toDateString(),
            'base_date' => $this->event_date->toDateString(),
            'time' => $this->event_time ? substr($this->event_time, 0, 5) : null,
            'type' => $this->type->value,
            'repeats_yearly' => $this->repeats_yearly,
            'visibility' => $this->visibility->value,
            'mine' => $mine,
            'owner' => $mine ? null : ($this->user?->profile?->display_name ?: $this->user?->name),
        ];
    }
}