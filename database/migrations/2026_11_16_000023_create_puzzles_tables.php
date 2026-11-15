<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('puzzles', function (Blueprint $table) {
            $table->id();
            $table->string('question', 500);
            $table->string('answer', 200);          // alternatives separated by |
            $table->string('hint', 200)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('puzzle_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('puzzle_id')->constrained('puzzles')->cascadeOnDelete();
            $table->date('puzzle_date');
            $table->string('outcome', 10);          // solved, revealed
            $table->timestamps();

            $table->unique(['user_id', 'puzzle_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('puzzle_results');
        Schema::dropIfExists('puzzles');
    }
};