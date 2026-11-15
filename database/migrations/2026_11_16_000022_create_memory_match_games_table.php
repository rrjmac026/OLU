<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memory_match_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_a_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_b_id')->constrained('users')->cascadeOnDelete();
            $table->json('deck');                            // 16 emojis, never sent in full
            $table->json('matched');                         // card indexes already paired
            $table->json('flipped');                         // 0 to 2 indexes face up right now
            $table->string('status', 10)->default('active'); // active, done
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memory_match_games');
    }
};