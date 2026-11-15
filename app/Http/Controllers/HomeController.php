<?php

namespace App\Http\Controllers;

use App\Enums\ContentKind;
use App\Models\CalendarEvent;
use App\Models\ContentItem;
use App\Models\DailyCheckin;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DailyAnswer;
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

        return Inertia::render('home', [
            'checkin_today' => $checkin ? ['mood' => $checkin->mood->value] : null,
            'next_event' => $next ? $next->toPayload($user, $nextDate) + [
                'days' => (int) Carbon::parse($today)->diffInDays(Carbon::parse($nextDate)),
            ] : null,
            'daily_compliment' => ContentItem::dailyPick(ContentKind::Compliment, $today),
            'daily_question' => ContentItem::dailyPick(ContentKind::Question, $today),
            'question_answered' => DailyAnswer::ownedBy($user)->whereDate('question_date', $today)->exists(),
            
        ]);
    }
}