<?php

namespace App\Support;

use App\Enums\Visibility;
use App\Models\Album;
use App\Models\BucketItem;
use App\Models\CalendarEvent;
use App\Models\DailyAnswer;
use App\Models\DailyCheckin;
use App\Models\GardenPlant;
use App\Models\JournalEntry;
use App\Models\Letter;
use App\Models\Memory;
use App\Models\MemoryMatchGame;
use App\Models\QuizQuestion;
use App\Models\Song;
use App\Models\TicTacToeGame;
use App\Models\TimelineMoment;
use App\Models\User;

class ActivityNotifier
{
    private static function say(string $type, string $text, ?string $preview, string $url, ?User $to = null): void
    {
        // Seeders, artisan commands and queue jobs have no acting person.
        if (app()->runningInConsole()) {
            return;
        }

        $actor = request()->user();

        if (! $actor) {
            return;
        }

        Notifier::send($actor, $to ?? Notifier::partnerOf($actor), $type, $text, $preview, $url);
    }

    private static function isShared($model): bool
    {
        return $model->visibility === Visibility::Shared;
    }

    public static function register(): void
    {
        // Private things never notify. Only shared ones do.
        DailyCheckin::created(function ($m) {
            if (self::isShared($m)) {
                self::say('checkin', 'shared a check-in 💗', $m->mood?->value, '/checkins');
            }
        });

        // Check-ins are saved with updateOrCreate, so re-saves and private -> shared arrive as updates.
        DailyCheckin::updated(function ($m) {
            if (self::isShared($m) && $m->wasChanged(['visibility', 'mood', 'note'])) {
                self::say('checkin', 'shared a check-in 💗', $m->mood?->value, '/checkins');
            }
        });

        JournalEntry::created(function ($m) {
            if (self::isShared($m)) {
                self::say('journal', 'shared a journal entry 📖', $m->title, '/journal');
            }
        });

        Memory::created(function ($m) {
            if (self::isShared($m)) {
                self::say('memory', 'added a memory 📸', $m->caption, "/memories/{$m->id}");
            }
        });

        CalendarEvent::created(function ($m) {
            if (self::isShared($m)) {
                self::say('calendar', 'added a calendar event 📅', $m->title, '/calendar');
            }
        });

        TimelineMoment::created(function ($m) {
            if (self::isShared($m)) {
                self::say('timeline', 'added a timeline moment ✨', $m->title, '/timeline');
            }
        });

        DailyAnswer::created(function ($m) {
            if (self::isShared($m)) {
                self::say('answer', "answered today's question 💭", null, '/questions');
            }
        });

        // Saving again just updates today's answer, so private -> shared and edits arrive as updates.
        DailyAnswer::updated(function ($m) {
            if (self::isShared($m) && $m->wasChanged(['visibility', 'answer'])) {
                self::say('answer', "answered today's question 💭", null, '/questions');
            }
        });

        // Letters go to the recipient only.
        Letter::created(function ($m) {
            self::say(
                'letter',
                $m->unlock_at?->isFuture() ? 'left you a letter that unlocks later 💌' : 'wrote you a letter 💌',
                $m->title,
                "/letters/{$m->id}",
                User::find($m->recipient_id),
            );
        });

        // Shared by nature.
        BucketItem::created(function ($m) {
            self::say('bucket', 'added to the bucket list 🌠', $m->title, '/bucket');
        });

        BucketItem::updated(function ($m) {
            if ($m->wasChanged('is_done') && $m->is_done) {
                self::say('bucket', 'ticked off a bucket list item ✅', $m->title, '/bucket');
            }
        });

        Song::created(function ($m) {
            self::say('song', 'added a song 🎵', $m->title, '/music');
        });

        QuizQuestion::created(function ($m) {
            self::say('quiz', 'added a couple quiz question 🧩', null, '/quiz');
        });

        // The partner only sees an album once it is published.
        Album::updated(function ($m) {
            if ($m->wasChanged('is_published') && $m->is_published) {
                self::say('album', 'published a new album 🎞️', $m->title, '/albums');
            }
        });

        GardenPlant::created(function () {
            self::say('garden', 'planted something in the garden 🌱', null, '/garden');
        });

        GardenPlant::updated(function ($m) {
            if ($m->wasChanged('stage')) {
                self::say('garden', 'watered the garden 💧', null, '/garden');
            }
        });

        TicTacToeGame::created(function () {
            self::say('game', 'started a Tic-tac-toe game ⭕', null, '/games/tictactoe');
        });

        MemoryMatchGame::created(function () {
            self::say('game', 'started a Memory Match game 🃏', null, '/games/memorymatch');
        });
    }
}