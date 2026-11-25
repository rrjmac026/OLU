<?php

namespace App\Models\Concerns;

use App\Enums\ActivityAction;
use App\Services\ActivityLogger;
use Illuminate\Support\Str;

trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(fn ($m) => ActivityLogger::log(
            ActivityAction::Created, 'created '.$m->activityLabel(), $m
        ));

        static::updated(function ($m) {
            $fields = array_values(array_diff(
                array_keys($m->getChanges()),
                ['updated_at', ...$m->activityIgnored()]
            ));

            if ($fields) {
                // field NAMES only, never values
                ActivityLogger::log(
                    ActivityAction::Updated, 'updated '.$m->activityLabel(), $m, ['fields' => $fields]
                );
            }
        });

        static::deleted(fn ($m) => ActivityLogger::log(
            ActivityAction::Deleted, 'deleted '.$m->activityLabel(), $m
        ));
    }

    public function activityLabel(): string
    {
        return property_exists($this, 'activityLabel')
            ? $this->activityLabel
            : 'a '.Str::of(class_basename($this))->snake(' ')->toString();
    }

    public function activityIgnored(): array
    {
        return property_exists($this, 'activityIgnore') ? $this->activityIgnore : [];
    }
}