<?php

namespace App\Models;

use App\Enums\BucketCategory;
use App\Enums\ContentKind;
use App\Enums\EventType;
use App\Enums\JournalType;
use App\Enums\LetterKind;
use App\Enums\LetterOccasion;
use App\Enums\Mood;
use App\Enums\Role;
use App\Enums\Visibility;
use App\Enums\WheelCategory;
use Carbon\Carbon;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class QuizQuestion extends Model
{
    protected $fillable = ['user_id', 'question', 'options', 'correct_index'];

    protected function casts(): array
    {
        return ['options' => 'array'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function guesses(): HasMany
    {
        return $this->hasMany(QuizGuess::class);
    }
}
