<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('timeline_moment_id')->nullable()
                ->constrained('timeline_moments')->nullOnDelete();
            $table->string('caption', 1000)->nullable();
            $table->date('taken_on')->nullable();
            $table->string('visibility', 20)->default('private');
            $table->timestamps();

            $table->index(['user_id', 'visibility']);
        });

        Schema::create('memory_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('memory_id')->constrained('memories')->cascadeOnDelete();
            $table->string('path');
            $table->string('mime', 50);
            $table->unsignedInteger('size');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memory_photos');
        Schema::dropIfExists('memories');
    }
};