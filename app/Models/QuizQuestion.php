<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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