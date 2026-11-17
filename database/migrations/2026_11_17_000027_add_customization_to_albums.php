<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('albums', function (Blueprint $table) {
            $table->string('description', 300)->nullable()->after('title');
            $table->string('theme', 20)->default('night')->after('description');
            $table->foreignId('default_song_id')->nullable()->after('theme')->constrained('songs')->nullOnDelete();
        });

        Schema::table('album_slides', function (Blueprint $table) {
            $table->unsignedTinyInteger('duration')->default(5)->after('caption');
            $table->string('caption_position', 10)->default('bottom')->after('duration');
            $table->string('filter', 10)->default('none')->after('caption_position');
            $table->string('transition', 10)->default('fade')->after('filter');
        });
    }

    public function down(): void
    {
        Schema::table('album_slides', function (Blueprint $table) {
            $table->dropColumn(['duration', 'caption_position', 'filter', 'transition']);
        });

        Schema::table('albums', function (Blueprint $table) {
            $table->dropConstrainedForeignId('default_song_id');
            $table->dropColumn(['description', 'theme']);
        });
    }
};