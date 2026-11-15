<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('question', 200);
            $table->json('options');
            $table->unsignedTinyInteger('correct_index');
            $table->timestamps();
        });

        Schema::create('quiz_guesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('choice_index');
            $table->boolean('is_correct');
            $table->timestamps();

            $table->unique(['quiz_question_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_guesses');
        Schema::dropIfExists('quiz_questions');
    }
};