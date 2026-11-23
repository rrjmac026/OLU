<?php

namespace App\Models;

use App\Enums\BucketCategory;
use App\Enums\ContentKind;
use App\Enums\EventType;
use App\Enums\JournalType;
use App\Enums\LetterKind;
use App\Enums\LetterOccasion;
use App\Enums\Mood;
use App\Enums\Role;
use App\Enums\Visibility;
use App\Enums\WheelCategory;
use Carbon\Carbon;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GardenPlant extends Model
{
    public const SLOTS = 12;

    public const MAX_STAGE = 2;

    public const KINDS = [
        'tulip' => 'ðŸŒ·',
        'sunflower' => 'ðŸŒ»',
        'rose' => 'ðŸŒ¹',
        'daisy' => 'ðŸŒ¼',
        'blossom' => 'ðŸŒ¸',
        'bouquet' => 'ðŸ’',
    ];

    protected $fillable = ['slot', 'kind', 'stage', 'planted_by'];

    /** Seedling, growing, then the chosen flower. */
    public function emoji(): string
    {
        return match (true) {
            $this->stage <= 0 => 'ðŸŒ±',
            $this->stage === 1 => 'ðŸŒ¿',
            default => self::KINDS[$this->kind] ?? 'ðŸŒ¸',
        };
    }
}
