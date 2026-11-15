<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20)->default('diary');
            $table->string('title', 120)->nullable();
            $table->text('body');
            $table->date('entry_date');
            $table->string('visibility', 20)->default('private');
            $table->timestamps();

            $table->index(['user_id', 'entry_date']);
            $table->index(['visibility', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};