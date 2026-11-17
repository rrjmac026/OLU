<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('albums', function (Blueprint $table) {
            $table->float('default_song_start')->nullable()->after('default_song_id');
            $table->float('default_song_end')->nullable()->after('default_song_start');
        });

        Schema::table('album_slides', function (Blueprint $table) {
            $table->float('song_start')->nullable()->after('song_id');
            $table->float('song_end')->nullable()->after('song_start');
        });
    }

    public function down(): void
    {
        Schema::table('album_slides', function (Blueprint $table) {
            $table->dropColumn(['song_start', 'song_end']);
        });

        Schema::table('albums', function (Blueprint $table) {
            $table->dropColumn(['default_song_start', 'default_song_end']);
        });
    }
};