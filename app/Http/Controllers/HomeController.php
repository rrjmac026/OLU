<?php

namespace App\Http\Controllers;

use App\Enums\ContentKind;
use App\Models\CalendarEvent;
use App\Models\ContentItem;
use App\Models\DailyAnswer;
use App\Models\DailyCheckin;
use App\Models\MemoryPhoto;
use App\Models\Song;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $checkin = DailyCheckin::ownedBy($user)
            ->where('checkin_date', DailyCheckin::todayFor($user))
            ->first();

        $today = Carbon::now($user->profile?->timezone ?: 'UTC')->toDateString();

        $next = null;
        $nextDate = null;

        foreach (CalendarEvent::with('user.profile')->visibleTo($user)->get() as $event) {
            $date = $event->nextOccurrence($today);

            if ($date !== null && ($nextDate === null || $date < $nextDate)) {
                $next = $event;
                $nextDate = $date;
            }
        }

        $memoryPhotos = MemoryPhoto::with('memory')
            ->latest()
            ->limit(60)
            ->get()
            ->filter(fn ($p) => $p->memory && $p->memory->canBeViewedBy($user))
            ->take(12)
            ->map(fn ($p) => [
                'id' => $p->id,
                'memory_id' => $p->memory_id,
                'url' => url('/memories/photos/'.$p->id),
                'title' => $p->memory->title,
            ])
            ->values();

        $songs = Song::whereNotNull('audio_path')
            ->latest('id')
            ->get()
            ->map(fn (Song $s) => [
                'id' => $s->id,
                'title' => $s->title,
                'artist' => $s->artist,
                'audio_url' => '/storage/'.$s->audio_path,
            ])
            ->values();

        return Inertia::render('home', [
            'checkin_today' => $checkin ? ['mood' => $checkin->mood->value] : null,
            'next_event' => $next ? $next->toPayload($user, $nextDate) + [
                'days' => (int) Carbon::parse($today)->diffInDays(Carbon::parse($nextDate)),
            ] : null,
            'daily_compliment' => ContentItem::dailyPick(ContentKind::Compliment, $today),
            'daily_question' => ContentItem::dailyPick(ContentKind::Question, $today),
            'question_answered' => DailyAnswer::ownedBy($user)->whereDate('question_date', $today)->exists(),
            'memory_photos' => $memoryPhotos,
            'songs' => $songs,
        ]);
    }
}