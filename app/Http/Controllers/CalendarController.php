<?php

namespace App\Http\Controllers;

use App\Http\Requests\CalendarEventRequest;
use App\Models\CalendarEvent;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();
        $today = $this->today($me);

        $month = $request->query('month');
        if (! is_string($month) || ! preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month)) {
            $month = substr($today, 0, 7);
        }
        [$year, $mon] = array_map('intval', explode('-', $month));

        $all = CalendarEvent::with('user.profile')->visibleTo($me)->get();

        $events = [];
        $upcoming = [];

        foreach ($all as $e) {
            if ($date = $e->occurrenceInMonth($year, $mon)) {
                $events[] = $e->toPayload($me, $date);
            }

            if ($next = $e->nextOccurrence($today)) {
                $upcoming[] = $e->toPayload($me, $next) + [
                    'days' => (int) Carbon::parse($today)->diffInDays(Carbon::parse($next)),
                ];
            }
        }

        $sort = fn ($a, $b) => [$a['date'], $a['time'] ?? ''] <=> [$b['date'], $b['time'] ?? ''];
        usort($events, $sort);
        usort($upcoming, $sort);

        return Inertia::render('calendar/index', [
            'month' => $month,
            'today' => $today,
            'events' => $events,
            'upcoming' => array_slice($upcoming, 0, 8),
        ]);
    }

    public function create(Request $request): Response
    {
        $me = $request->user();
        $date = $request->query('date');

        if (! is_string($date) || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $date = $this->today($me);
        }

        return Inertia::render('calendar/create', [
            'date' => $date,
            'defaultVisibility' => $me->privacy?->default_entry_visibility?->value ?? 'private',
        ]);
    }

    public function store(CalendarEventRequest $request): RedirectResponse
    {
        $me = $request->user();

        $event = new CalendarEvent($this->fields($request));
        $event->user_id = $me->id;
        $event->save();

        return $this->backToMonth($event, 'Event saved.');
    }

    public function edit(Request $request, CalendarEvent $event): Response
    {
        $me = $request->user();
        $this->ownedOrFail($event, $me);

        return Inertia::render('calendar/edit', [
            'event' => $event->toPayload($me),
        ]);
    }

    public function update(CalendarEventRequest $request, CalendarEvent $event): RedirectResponse
    {
        $this->ownedOrFail($event, $request->user());

        $event->fill($this->fields($request))->save();

        return $this->backToMonth($event, 'Event updated.');
    }

    public function destroy(Request $request, CalendarEvent $event): RedirectResponse
    {
        $this->ownedOrFail($event, $request->user());

        $event->delete();

        return redirect('/calendar')->with('status', 'Event deleted.');
    }

    private function fields(CalendarEventRequest $request): array
    {
        $data = $request->validated();
        $data['event_time'] = $data['event_time'] ?? null;
        $data['notes'] = $data['notes'] ?? null;
        $data['repeats_yearly'] = (bool) ($data['repeats_yearly'] ?? false);

        return $data;
    }

    /** Non-owners get a 404, so existence is never revealed. */
    private function ownedOrFail(CalendarEvent $event, User $me): void
    {
        abort_unless($event->user_id === $me->id, 404);
    }

    private function backToMonth(CalendarEvent $event, string $status): RedirectResponse
    {
        return redirect('/calendar?month=' . substr($event->event_date->toDateString(), 0, 7))
            ->with('status', $status);
    }

    /** "Today" in her own timezone. */
    private function today(User $me): string
    {
        return Carbon::now($me->profile?->timezone ?: 'UTC')->toDateString();
    }
}