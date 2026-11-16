<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GardenPlant extends Model
{
    public const SLOTS = 12;
    public const MAX_STAGE = 2;

    public const KINDS = [
        'tulip' => '🌷',
        'sunflower' => '🌻',
        'rose' => '🌹',
        'daisy' => '🌼',
        'blossom' => '🌸',
        'bouquet' => '💐',
    ];

    protected $fillable = ['slot', 'kind', 'stage', 'planted_by'];

    /** Seedling, growing, then the chosen flower. */
    public function emoji(): string
    {
        return match (true) {
            $this->stage <= 0 => '🌱',
            $this->stage === 1 => '🌿',
            default => self::KINDS[$this->kind] ?? '🌸',
        };
    }
}