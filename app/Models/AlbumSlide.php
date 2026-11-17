<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlbumSlide extends Model
{
    protected $fillable = [
        'album_id', 'memory_photo_id', 'song_id', 'song_start', 'song_end', 'caption', 'duration',
        'caption_position', 'filter', 'transition', 'position',
    ];

    protected function casts(): array
    {
        return [
            'song_start' => 'float',
            'song_end' => 'float',
        ];
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    public function photo(): BelongsTo
    {
        return $this->belongsTo(MemoryPhoto::class, 'memory_photo_id');
    }

    public function song(): BelongsTo
    {
        return $this->belongsTo(Song::class);
    }
}