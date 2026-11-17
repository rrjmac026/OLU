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

class Album extends Model
{
    public const THEMES = ['night', 'rose', 'sunset', 'forest'];

    public const FILTERS = ['none', 'warm', 'cool', 'bw', 'dreamy'];

    public const TRANSITIONS = ['fade', 'slide', 'zoom'];

    public const POSITIONS = ['top', 'center', 'bottom'];

    protected $fillable = [
        'user_id', 'title', 'description', 'theme',
        'default_song_id', 'default_song_start', 'default_song_end', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'default_song_start' => 'float',
            'default_song_end' => 'float',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function defaultSong(): BelongsTo
    {
        return $this->belongsTo(Song::class, 'default_song_id');
    }

    public function slides(): HasMany
    {
        return $this->hasMany(AlbumSlide::class)->orderBy('position');
    }

    /** Admin sees everything; everyone else only published albums. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $user->isAdmin() ? $query : $query->where('is_published', true);
    }

    public function canBeViewedBy(User $user): bool
    {
        return $user->isAdmin() || $this->is_published;
    }
}

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

class Background extends Model
{
    protected $fillable = ['user_id', 'path', 'mime', 'size', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

class BucketItem extends Model
{
    protected $fillable = ['user_id', 'title', 'category', 'note', 'is_done', 'done_at'];

    protected function casts(): array
    {
        return [
            'category' => BucketCategory::class,
            'is_done' => 'boolean',
            'done_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

class CalendarEvent extends Model
{
    protected $fillable = [
        'title', 'notes', 'event_date', 'event_time', 'type', 'repeats_yearly', 'visibility',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'repeats_yearly' => 'boolean',
            'type' => EventType::class,
            'visibility' => Visibility::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** My own events plus the other person's shared ones. */
    public function scopeVisibleTo(Builder $query, User $viewer): Builder
    {
        return $query->where(function ($w) use ($viewer) {
            $w->where('user_id', $viewer->id)
                ->orWhere(fn ($x) => $x->where('user_id', '!=', $viewer->id)->where('visibility', 'shared'));
        });
    }

    /** Date (Y-m-d) of this event in a given year. Feb 29 falls back to Feb 28 in non-leap years. */
    public function occurrenceDate(int $year): string
    {
        $month = $this->event_date->month;
        $day = min($this->event_date->day, Carbon::create($year, $month, 1)->daysInMonth);

        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    /** The date this event lands on in the given month, or null if it doesn't. */
    public function occurrenceInMonth(int $year, int $month): ?string
    {
        $d = $this->event_date;

        if ($this->repeats_yearly) {
            return ($d->month === $month && $d->year <= $year) ? $this->occurrenceDate($year) : null;
        }

        return ($d->year === $year && $d->month === $month) ? $d->toDateString() : null;
    }

    /** Next date (Y-m-d) on or after $today, or null for one-off events already past. */
    public function nextOccurrence(string $today): ?string
    {
        $start = $this->event_date->toDateString();

        if (! $this->repeats_yearly) {
            return $start >= $today ? $start : null;
        }

        $year = max((int) substr($today, 0, 4), $this->event_date->year);

        for ($y = $year; $y <= $year + 1; $y++) {
            $occ = $this->occurrenceDate($y);
            if ($occ >= $today && $occ >= $start) {
                return $occ;
            }
        }

        return null;
    }

    public function toPayload(User $viewer, ?string $date = null): array
    {
        $mine = $this->user_id === $viewer->id;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'notes' => $this->notes,
            'date' => $date ?? $this->event_date->toDateString(),
            'base_date' => $this->event_date->toDateString(),
            'time' => $this->event_time ? substr($this->event_time, 0, 5) : null,
            'type' => $this->type->value,
            'repeats_yearly' => $this->repeats_yearly,
            'visibility' => $this->visibility->value,
            'mine' => $mine,
            'owner' => $mine ? null : ($this->user?->profile?->display_name ?: $this->user?->name),
        ];
    }
}

class ContentItem extends Model
{
    protected $fillable = ['kind', 'body', 'is_active'];

    protected function casts(): array
    {
        return [
            'kind' => ContentKind::class,
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOfKind(Builder $query, ContentKind $kind): Builder
    {
        return $query->where('kind', $kind->value);
    }

    /** Same pick all day (per her timezone), changes the next day. */
    public static function dailyPick(ContentKind $kind, string $today): ?string
    {
        $bodies = static::active()->ofKind($kind)->orderBy('id')->pluck('body');

        if ($bodies->isEmpty()) {
            return null;
        }

        return $bodies[crc32($kind->value.$today) % $bodies->count()];
    }

    /** A random active one, avoiding the one she already sees when there is a choice. */
    public static function randomBody(ContentKind $kind, ?string $exclude = null): ?string
    {
        $query = static::active()->ofKind($kind);

        if ($exclude !== null) {
            $query->where('body', '!=', $exclude);
        }

        return $query->inRandomOrder()->value('body')
            ?? static::active()->ofKind($kind)->value('body');
    }
}

class DailyAnswer extends Model
{
    protected $fillable = ['user_id', 'question_date', 'question', 'answer', 'visibility'];

    protected function casts(): array
    {
        return [
            'question_date' => 'date',
            'visibility' => Visibility::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    /** Other people's SHARED answers only. */
    public function scopeSharedFromOthers(Builder $query, User $viewer): Builder
    {
        return $query->where('user_id', '!=', $viewer->id)
            ->where('visibility', Visibility::Shared->value);
    }

    public function dateKey(): string
    {
        return $this->question_date->toDateString();
    }
}

class DailyCheckin extends Model
{
    protected $fillable = [
        'user_id',
        'checkin_date',
        'mood',
        'note',
        'visibility',
    ];

    protected function casts(): array
    {
        return [
            'checkin_date' => 'date',
            'mood' => Mood::class,
            'visibility' => Visibility::class,
        ];
    }

    /**
     * Always query through this scope so a user only ever touches their own rows.
     */
    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    /**
     * "Today" in the user's own timezone, as Y-m-d.
     */
    public static function todayFor(User $user): string
    {
        return now($user->profile?->timezone ?? 'UTC')->toDateString();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeSharedFrom(Builder $query, User $partner): Builder
    {
        return $query->where('user_id', $partner->id)
            ->where('visibility', Visibility::Shared->value);
    }
}

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

class GardenWallet extends Model
{
    protected $fillable = ['user_id', 'spent'];

    protected $attributes = [
        'spent' => 0,
    ];

    protected function casts(): array
    {
        return ['spent' => 'integer'];
    }
}

class JournalEntry extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'entry_date',
        'visibility',
    ];

    protected function casts(): array
    {
        return [
            'type' => JournalType::class,
            'visibility' => Visibility::class,
            'entry_date' => 'date',
        ];
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    /**
     * Entries written by someone else that they chose to share.
     */
    public function scopeSharedWith(Builder $query, User $viewer): Builder
    {
        return $query
            ->where('visibility', Visibility::Shared->value)
            ->where('user_id', '!=', $viewer->id);
    }

    public function canBeViewedBy(User $user): bool
    {
        return $this->user_id === $user->id || $this->visibility === Visibility::Shared;
    }

    public static function todayFor(User $user): string
    {
        return now($user->profile?->timezone ?? 'UTC')->toDateString();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

class Letter extends Model
{
    protected $fillable = [
        'sender_id', 'recipient_id', 'kind', 'occasion',
        'title', 'body', 'unlock_at', 'opened_at',
    ];

    protected function casts(): array
    {
        return [
            'kind' => LetterKind::class,
            'occasion' => LetterOccasion::class,
            'unlock_at' => 'datetime',
            'opened_at' => 'datetime',
        ];
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /** Letters the user wrote or received. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $q) use ($user) {
            $q->where('sender_id', $user->id)->orWhere('recipient_id', $user->id);
        });
    }

    public function isLocked(): bool
    {
        return $this->unlock_at !== null && $this->unlock_at->isFuture();
    }

    public function isSender(User $user): bool
    {
        return $this->sender_id === $user->id;
    }

    public function isRecipient(User $user): bool
    {
        return $this->recipient_id === $user->id;
    }

    public function canBeViewedBy(User $user): bool
    {
        return $this->isSender($user) || $this->isRecipient($user);
    }
}

class Memory extends Model
{
    protected $fillable = ['user_id', 'timeline_moment_id', 'caption', 'taken_on', 'visibility'];

    protected function casts(): array
    {
        return [
            'taken_on' => 'date',
            'visibility' => Visibility::class,
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MemoryPhoto::class)->orderBy('id');
    }

    public function moment(): BelongsTo
    {
        return $this->belongsTo(TimelineMoment::class, 'timeline_moment_id');
    }

    /** My memories, plus the other person's shared ones. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('visibility', Visibility::Shared->value);
        });
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function canBeViewedBy(User $user): bool
    {
        return $this->isOwnedBy($user) || $this->visibility === Visibility::Shared;
    }
}

class MemoryMatchGame extends Model
{
    protected $fillable = [
        'user_a_id', 'user_b_id', 'deck', 'matched', 'flipped', 'status',
    ];

    public const SYMBOLS = ['🌸', '🌙', '⭐', '🍓', '🦋', '🎧', '🐱', '☕'];

    protected function casts(): array
    {
        return [
            'deck' => 'array',
            'matched' => 'array',
            'flipped' => 'array',
        ];
    }

    /** Only games the user plays in. Non-players get a 404 via firstOrFail. */
    public function scopeInvolving(Builder $query, User $user): Builder
    {
        return $query->where(function ($w) use ($user) {
            $w->where('user_a_id', $user->id)->orWhere('user_b_id', $user->id);
        });
    }

    /** A fresh shuffled deck: every symbol twice. */
    public static function newDeck(): array
    {
        return collect(self::SYMBOLS)
            ->merge(self::SYMBOLS)
            ->shuffle()
            ->values()
            ->all();
    }
}

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

class Message extends Model
{
    protected $fillable = ['sender_id', 'recipient_id', 'body'];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'edited_at' => 'datetime',
            'unsent_at' => 'datetime',
            'sender_removed_at' => 'datetime',
            'recipient_removed_at' => 'datetime',
        ];
    }

    /** One private channel per pair, always low id first. */
    public static function channelFor(int $a, int $b): string
    {
        return 'chat.'.min($a, $b).'.'.max($a, $b);
    }

    public function scopeBetween(Builder $query, int $a, int $b): Builder
    {
        return $query->where(function ($w) use ($a, $b) {
            $w->where(fn ($x) => $x->where('sender_id', $a)->where('recipient_id', $b))
                ->orWhere(fn ($x) => $x->where('sender_id', $b)->where('recipient_id', $a));
        });
    }

    /** Hides messages this user removed from their own view. */
    public function scopeVisibleTo(Builder $query, int $userId): Builder
    {
        return $query->where(function ($w) use ($userId) {
            $w->where(fn ($x) => $x->where('sender_id', $userId)->whereNull('sender_removed_at'))
                ->orWhere(fn ($x) => $x->where('recipient_id', $userId)->whereNull('recipient_removed_at'));
        });
    }

    public function toPayload(): array
    {
        $unsent = $this->unsent_at !== null;

        return [
            'id' => $this->id,
            'sender_id' => $this->sender_id,
            'body' => $unsent ? '' : $this->body,
            'unsent' => $unsent,
            'edited' => $this->edited_at !== null,
            'created_at' => $this->created_at?->toIso8601String(),
            'read_at' => $this->read_at?->toIso8601String(),
        ];
    }
}

class PrivacySetting extends Model
{
    protected $fillable = [
        'user_id',
        'share_usage_summary',
        'default_entry_visibility',
    ];

    protected function casts(): array
    {
        return [
            'share_usage_summary' => 'boolean',
            'default_entry_visibility' => Visibility::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

class Profile extends Model
{
    protected $fillable = [
        'user_id',
        'display_name',
        'nickname',
        'avatar_path',
        'birthday',
        'bio',
        'timezone',
    ];

    protected function casts(): array
    {
        return [
            'birthday' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

class Puzzle extends Model
{
    protected $fillable = ['question', 'answer', 'hint', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Same puzzle for everyone on the same date key. */
    public static function dailyPick(string $date): ?self
    {
        $ids = static::active()->orderBy('id')->pluck('id');

        if ($ids->isEmpty()) {
            return null;
        }

        $day = intdiv(strtotime($date.' UTC'), 86400);

        return static::find($ids[$day % $ids->count()]);
    }

    public static function normalize(string $text): string
    {
        return preg_replace('/[^\p{L}\p{N}]/u', '', mb_strtolower($text)) ?? '';
    }

    public function accepts(string $guess): bool
    {
        $guess = static::normalize($guess);

        if ($guess === '') {
            return false;
        }

        foreach (explode('|', $this->answer) as $option) {
            if (static::normalize($option) === $guess) {
                return true;
            }
        }

        return false;
    }

    /** The answer as shown to the player (first option). */
    public function displayAnswer(): string
    {
        return trim(explode('|', $this->answer)[0]);
    }
}

class PuzzleResult extends Model
{
    protected $fillable = ['user_id', 'puzzle_id', 'puzzle_date', 'outcome'];
}

class QuizGuess extends Model
{
    protected $fillable = ['quiz_question_id', 'user_id', 'choice_index', 'is_correct'];

    protected function casts(): array
    {
        return ['is_correct' => 'boolean'];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'quiz_question_id');
    }
}

class QuizQuestion extends Model
{
    protected $fillable = ['user_id', 'question', 'options', 'correct_index'];

    protected function casts(): array
    {
        return ['options' => 'array'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function guesses(): HasMany
    {
        return $this->hasMany(QuizGuess::class);
    }
}

class Song extends Model
{
    protected $fillable = ['user_id', 'title', 'artist', 'link', 'audio_path', 'note'];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

class TicTacToeGame extends Model
{
    protected $table = 'tictactoe_games';

    protected $fillable = [
        'x_user_id', 'o_user_id', 'board', 'turn', 'status', 'winner_id',
    ];

    public const LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];

    /** Only games the user plays in. Non-players get a 404 via firstOrFail. */
    public function scopeInvolving(Builder $query, User $user): Builder
    {
        return $query->where(function ($w) use ($user) {
            $w->where('x_user_id', $user->id)->orWhere('o_user_id', $user->id);
        });
    }

    public function symbolFor(User $user): ?string
    {
        return match ($user->id) {
            $this->x_user_id => 'X',
            $this->o_user_id => 'O',
            default => null,
        };
    }

    public static function winningLine(string $board): ?array
    {
        foreach (self::LINES as [$a, $b, $c]) {
            if ($board[$a] !== '-' && $board[$a] === $board[$b] && $board[$a] === $board[$c]) {
                return [$a, $b, $c];
            }
        }

        return null;
    }
}

class TimelineMoment extends Model
{
    protected $fillable = ['title', 'story', 'moment_date', 'visibility'];

    protected function casts(): array
    {
        return [
            'moment_date' => 'date',
            'visibility' => Visibility::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function memories(): HasMany
    {
        return $this->hasMany(Memory::class, 'timeline_moment_id');
    }

    /** My own moments plus the other person's shared ones. */
    public function scopeVisibleTo(Builder $query, User $viewer): Builder
    {
        return $query->where(function ($w) use ($viewer) {
            $w->where('user_id', $viewer->id)
                ->orWhere(fn ($x) => $x->where('user_id', '!=', $viewer->id)->where('visibility', 'shared'));
        });
    }

    public function toPayload(User $viewer): array
    {
        $mine = $this->user_id === $viewer->id;

        $payload = [
            'id' => $this->id,
            'title' => $this->title,
            'story' => $this->story,
            'date' => $this->moment_date->toDateString(),
            'visibility' => $this->visibility->value,
            'mine' => $mine,
            'owner' => $mine ? null : ($this->user?->profile?->display_name ?: $this->user?->name),
        ];

        // Only filled when the controller eager-loaded the memories this viewer may see.
        if ($this->relationLoaded('memories')) {
            $payload['memories_count'] = $this->memories->count();
            $payload['photo_id'] = $this->memories
                ->flatMap(fn (Memory $m) => $m->photos)
                ->first()?->id;
        }

        return $payload;
    }
}

class User extends Model
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'role' => Role::class,
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (User $user) {
            $user->profile()->create(['display_name' => $user->name]);
            $user->settings()->create();
            $user->privacy()->create();
        });
    }

    public function isAdmin(): bool
    {
        return $this->role === Role::Admin;
    }

    /**
     * Stored in the session at login. If the password changes, the stamp no
     * longer matches and every other session for this user is signed out.
     */
    public function authStamp(): string
    {
        return hash('sha256', $this->password);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function settings(): HasOne
    {
        return $this->hasOne(UserSetting::class);
    }

    public function privacy(): HasOne
    {
        return $this->hasOne(PrivacySetting::class);
    }
}

class UserAchievement extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'key', 'unlocked_at'];

    protected function casts(): array
    {
        return ['unlocked_at' => 'datetime'];
    }
}

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'theme',
        'notifications_enabled',
        'notification_previews',
        'gamification_enabled',
    ];

    protected function casts(): array
    {
        return [
            'notifications_enabled' => 'boolean',
            'notification_previews' => 'boolean',
            'gamification_enabled' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

class WheelItem extends Model
{
    protected $fillable = ['category', 'label', 'is_active'];

    protected function casts(): array
    {
        return [
            'category' => WheelCategory::class,
            'is_active' => 'boolean',
        ];
    }
}
