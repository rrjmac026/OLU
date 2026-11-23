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

class QuizGuess extends Model
{
    protected $fillable = ['quiz_question_id', 'user_id', 'choice_index', 'is_correct'];

    protected function casts(): array
    {
        return ['is_correct' => 'boolean'];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'quiz_question_id');
    }
}
