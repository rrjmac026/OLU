<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timeline_moments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 120);
            $table->text('story')->nullable();
            $table->date('moment_date');
            $table->string('visibility', 10)->default('private');
            $table->timestamps();

            $table->index(['user_id', 'moment_date']);
            $table->index(['visibility', 'moment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timeline_moments');
    }
};