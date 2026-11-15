<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('theme', 20)->default('system');
            $table->boolean('notifications_enabled')->default(true);
            // Safe notifications: previews never include private content unless explicitly enabled.
            $table->boolean('notification_previews')->default(false);
            // Healthy gamification: she can opt out at any time.
            $table->boolean('gamification_enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};