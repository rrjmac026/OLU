<?php

namespace App\Http\Controllers;

use App\Models\Puzzle;
use App\Models\PuzzleResult;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PuzzleController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();
        $today = $this->today($me);
        $result = $this->resultFor($me, $today);

        // If she already played today, keep showing that puzzle even if the admin hides it later.
        $puzzle = $result ? Puzzle::find($result->puzzle_id) : Puzzle::dailyPick($today);
        $done = $result !== null;

        return Inertia::render('puzzle/index', [
            'puzzle' => $puzzle ? [
                'question' => $puzzle->question,
                'hint' => $puzzle->hint,
                'outcome' => $result?->outcome,
                'answer' => $done ? $puzzle->displayAnswer() : null,
            ] : null,
            'isAdmin' => $me->isAdmin(),
            'items' => $me->isAdmin()
                ? Puzzle::orderByDesc('id')->get(['id', 'question', 'answer', 'hint', 'is_active'])
                : [],
        ]);
    }

    public function guess(Request $request): RedirectResponse
    {
        $me = $request->user();
        $today = $this->today($me);

        $data = $request->validate(['guess' => ['required', 'string', 'max:200']]);

        if ($this->resultFor($me, $today)) {
            return back();
        }

        $puzzle = Puzzle::dailyPick($today);
        abort_unless($puzzle, 404);

        if (! $puzzle->accepts($data['guess'])) {
            return back()->withErrors(['guess' => 'Not quite, try again 💗']);
        }

        $this->record($me, $puzzle, $today, 'solved');

        return back();
    }

    public function reveal(Request $request): RedirectResponse
    {
        $me = $request->user();
        $today = $this->today($me);

        if (! $this->resultFor($me, $today)) {
            $puzzle = Puzzle::dailyPick($today);
            abort_unless($puzzle, 404);
            $this->record($me, $puzzle, $today, 'revealed');
        }

        return back();
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string', 'max:200'],
            'hint' => ['nullable', 'string', 'max:200'],
        ]);

        Puzzle::create($data);

        return back();
    }

    public function toggle(Puzzle $item): RedirectResponse
    {
        $item->update(['is_active' => ! $item->is_active]);

        return back();
    }

    public function destroy(Puzzle $item): RedirectResponse
    {
        $item->delete();

        return back();
    }

    /** Today's date in the person's own timezone. */
    private function today(User $user): string
    {
        $tz = $user->profile?->timezone ?: 'UTC';

        return now($tz)->toDateString();
    }

    private function resultFor(User $user, string $date): ?PuzzleResult
    {
        return PuzzleResult::where('user_id', $user->id)->where('puzzle_date', $date)->first();
    }

    private function record(User $user, Puzzle $puzzle, string $date, string $outcome): void
    {
        PuzzleResult::firstOrCreate(
            ['user_id' => $user->id, 'puzzle_date' => $date],
            ['puzzle_id' => $puzzle->id, 'outcome' => $outcome],
        );
    }
}