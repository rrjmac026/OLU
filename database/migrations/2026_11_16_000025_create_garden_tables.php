<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('garden_plants', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('slot')->unique();
            $table->string('kind', 20);
            $table->unsignedTinyInteger('stage')->default(0);
            $table->foreignId('planted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('garden_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('spent')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('garden_wallets');
        Schema::dropIfExists('garden_plants');
    }
};