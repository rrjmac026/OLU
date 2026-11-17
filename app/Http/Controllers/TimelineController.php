<?php

namespace App\Http\Controllers;

use App\Http\Requests\TimelineMomentRequest;
use App\Models\TimelineMoment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimelineController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();

        $moments = TimelineMoment::with([
                'user.profile',
                'memories' => fn ($q) => $q->visibleTo($me)->with('photos')->orderBy('id'),
            ])
            ->visibleTo($me)
            ->orderByDesc('moment_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (TimelineMoment $m) => $m->toPayload($me))
            ->all();

        return Inertia::render('timeline/index', ['moments' => $moments]);
    }

    public function create(Request $request): Response
    {
        $me = $request->user();

        return Inertia::render('timeline/create', [
            'date' => Carbon::now($me->profile?->timezone ?: 'UTC')->toDateString(),
            'defaultVisibility' => $me->privacy?->default_entry_visibility?->value ?? 'private',
        ]);
    }

    public function store(TimelineMomentRequest $request): RedirectResponse
    {
        $moment = new TimelineMoment($this->fields($request));
        $moment->user_id = $request->user()->id;
        $moment->save();

        return redirect('/timeline')->with('status', 'Moment saved.');
    }

    public function edit(Request $request, TimelineMoment $moment): Response
    {
        $me = $request->user();
        $this->ownedOrFail($moment, $me);

        return Inertia::render('timeline/edit', ['moment' => $moment->toPayload($me)]);
    }

    public function update(TimelineMomentRequest $request, TimelineMoment $moment): RedirectResponse
    {
        $this->ownedOrFail($moment, $request->user());

        $moment->fill($this->fields($request))->save();

        return redirect('/timeline')->with('status', 'Moment updated.');
    }

    public function destroy(Request $request, TimelineMoment $moment): RedirectResponse
    {
        $this->ownedOrFail($moment, $request->user());

        $moment->delete();

        return redirect('/timeline')->with('status', 'Moment deleted.');
    }

    private function fields(TimelineMomentRequest $request): array
    {
        $data = $request->validated();
        $data['story'] = $data['story'] ?? null;

        return $data;
    }

    /** Non-owners get a 404, so existence is never revealed. */
    private function ownedOrFail(TimelineMoment $moment, User $me): void
    {
        abort_unless($moment->user_id === $me->id, 404);
    }
}