<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 120);
            $table->text('notes')->nullable();
            $table->date('event_date');
            $table->time('event_time')->nullable();
            $table->string('type', 20)->default('other');
            $table->boolean('repeats_yearly')->default(false);
            $table->string('visibility', 10)->default('private');
            $table->timestamps();

            $table->index(['user_id', 'event_date']);
            $table->index(['visibility', 'event_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};