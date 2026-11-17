<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemoryPhoto extends Model
{
    protected $fillable = ['memory_id', 'path', 'mime', 'size'];

    public function memory(): BelongsTo
    {
        return $this->belongsTo(Memory::class);
    }
    /** True when this photo is used by a published album (so the partner may view it). */
    public function isInPublishedAlbum(): bool
    {
        return AlbumSlide::where('memory_photo_id', $this->id)
            ->whereHas('album', fn ($q) => $q->where('is_published', true))
            ->exists();
    }
}