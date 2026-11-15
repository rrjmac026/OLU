<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('question_date');
            $table->string('question', 1000); // snapshot, survives later content edits
            $table->text('answer');
            $table->string('visibility', 20)->default('private');
            $table->timestamps();

            $table->unique(['user_id', 'question_date']);
            $table->index(['question_date', 'visibility']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_answers');
    }
};