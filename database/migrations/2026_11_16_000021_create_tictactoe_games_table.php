<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tictactoe_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('x_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('o_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('board', 9)->default('---------');
            $table->char('turn', 1)->default('X');
            $table->string('status', 10)->default('active'); // active, won, draw
            $table->foreignId('winner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tictactoe_games');
    }
};