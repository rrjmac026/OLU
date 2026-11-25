<?php

namespace App\Models;

use App\Enums\Visibility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\LogsActivity;

class DailyAnswer extends Model
{
    use LogsActivity;

    protected string $activityLabel = 'a daily answer';
    protected array $activityIgnore = ['question'];
    protected $fillable = ['user_id', 'question_date', 'question', 'answer', 'visibility'];

    protected function casts(): array
    {
        return [
            'question_date' => 'date',
            'visibility' => Visibility::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    /** Other people's SHARED answers only. */
    public function scopeSharedFromOthers(Builder $query, User $viewer): Builder
    {
        return $query->where('user_id', '!=', $viewer->id)
            ->where('visibility', Visibility::Shared->value);
    }

    public function dateKey(): string
    {
        return $this->question_date->toDateString();
    }
}