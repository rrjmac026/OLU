<?php

namespace App\Http\Controllers;

use App\Enums\ContentKind;
use App\Http\Requests\DailyAnswerRequest;
use App\Models\ContentItem;
use App\Models\DailyAnswer;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = $this->today($user);
        $question = ContentItem::dailyPick(ContentKind::Question, $today);

        $mine = DailyAnswer::ownedBy($user)
            ->orderByDesc('question_date')
            ->limit(60)
            ->get();

        $myDates = $mine->map(fn (DailyAnswer $a) => $a->dateKey())->all();

        // The other person's shared answers, only for days I answered myself (no peeking).
        $theirs = DailyAnswer::with('user.profile')
            ->sharedFromOthers($user)
            ->whereIn('question_date', $myDates)
            ->get()
            ->keyBy(fn (DailyAnswer $a) => $a->dateKey());

        $todayMine = $mine->first(fn (DailyAnswer $a) => $a->dateKey() === $today);

        $history = $mine
            ->filter(fn (DailyAnswer $a) => $a->dateKey() !== $today)
            ->map(fn (DailyAnswer $a) => [
                'date_label' => $a->question_date->format('M j, Y'),
                'question' => $a->question,
                'mine' => $this->mineBlock($a),
                'theirs' => $this->theirsBlock($theirs->get($a->dateKey())),
            ])
            ->values();

        return Inertia::render('questions/index', [
            'today' => [
                'question' => $todayMine?->question ?? $question,
                'mine' => $todayMine ? $this->mineBlock($todayMine) : null,
                'theirs' => $todayMine ? $this->theirsBlock($theirs->get($today)) : null,
            ],
            'history' => $history,
            'default_visibility' => $user->privacy?->default_entry_visibility?->value ?? 'private',
        ]);
    }

    /** Answers today's question; saving again just updates today's answer. */
    public function store(DailyAnswerRequest $request): RedirectResponse
    {
        $user = $request->user();
        $today = $this->today($user);
        $data = $request->validated();

        $existing = DailyAnswer::ownedBy($user)->whereDate('question_date', $today)->first();

        if ($existing) {
            $existing->update([
                'answer' => $data['answer'],
                'visibility' => $data['visibility'],
            ]);
        } else {
            $question = ContentItem::dailyPick(ContentKind::Question, $today);

            if ($question === null) {
                throw ValidationException::withMessages(['answer' => 'There is no question today.']);
            }

            DailyAnswer::create([
                'user_id' => $user->id,
                'question_date' => $today,
                'question' => $question,
                'answer' => $data['answer'],
                'visibility' => $data['visibility'],
            ]);
        }

        return back()->with('status', 'Answer saved.');
    }

    public function destroy(Request $request, DailyAnswer $answer): RedirectResponse
    {
        abort_unless($answer->user_id === $request->user()->id, 404);

        $answer->delete();

        return back()->with('status', 'Answer deleted.');
    }

    // ---------- helpers ----------

    private function today(User $user): string
    {
        return Carbon::now($user->profile?->timezone ?: 'UTC')->toDateString();
    }

    private function mineBlock(DailyAnswer $a): array
    {
        return [
            'id' => $a->id,
            'answer' => $a->answer,
            'visibility' => $a->visibility->value,
        ];
    }

    private function theirsBlock(?DailyAnswer $a): ?array
    {
        if (! $a) {
            return null;
        }

        return [
            'name' => $a->user->profile?->display_name ?: $a->user->name,
            'answer' => $a->answer,
        ];
    }
}