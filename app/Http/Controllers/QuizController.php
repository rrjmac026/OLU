<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuizQuestionRequest;
use App\Models\QuizGuess;
use App\Models\QuizQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Questions written by the other person: for me to guess.
        $toPlay = QuizQuestion::with('author.profile')
            ->where('user_id', '!=', $user->id)
            ->latest('id')
            ->get();

        $myGuesses = QuizGuess::where('user_id', $user->id)
            ->whereIn('quiz_question_id', $toPlay->pluck('id'))
            ->get()
            ->keyBy('quiz_question_id');

        $play = $toPlay->map(function (QuizQuestion $q) use ($myGuesses) {
            $guess = $myGuesses->get($q->id);

            return [
                'id' => $q->id,
                'about' => $q->author->profile?->display_name ?: $q->author->name,
                'question' => $q->question,
                'options' => $q->options,
                'guessed' => $guess !== null,
                'my_choice' => $guess?->choice_index,
                // The right answer is only revealed AFTER I have guessed.
                'correct' => $guess ? $q->correct_index : null,
                'matched' => $guess?->is_correct,
            ];
        })->values();

        // My own questions, with how the other person did.
        $mine = QuizQuestion::with('guesses')
            ->where('user_id', $user->id)
            ->latest('id')
            ->get()
            ->map(function (QuizQuestion $q) {
                $guess = $q->guesses->first();

                return [
                    'id' => $q->id,
                    'question' => $q->question,
                    'options' => $q->options,
                    'correct' => $q->correct_index,
                    'answered' => $guess !== null,
                    'their_choice' => $guess?->choice_index,
                    'matched' => $guess?->is_correct,
                ];
            })->values();

        return Inertia::render('quiz/index', ['play' => $play, 'mine' => $mine]);
    }

    public function storeQuestion(QuizQuestionRequest $request): RedirectResponse
    {
        $data = $request->validated();

        QuizQuestion::create([
            'user_id' => $request->user()->id,
            'question' => $data['question'],
            'options' => array_values($data['options']),
            'correct_index' => $data['correct'],
        ]);

        return back()->with('status', 'Question added.');
    }

    public function destroyQuestion(Request $request, QuizQuestion $question): RedirectResponse
    {
        abort_unless($question->user_id === $request->user()->id, 404);

        $question->delete(); // guesses cascade

        return back()->with('status', 'Question removed.');
    }

    public function guess(Request $request, QuizQuestion $question): RedirectResponse
    {
        $user = $request->user();

        // You can only guess the other person's questions.
        abort_if($question->user_id === $user->id, 404);

        $data = $request->validate([
            'choice' => ['required', 'integer', 'min:0', 'max:' . (count($question->options) - 1)],
        ]);

        QuizGuess::firstOrCreate(
            ['quiz_question_id' => $question->id, 'user_id' => $user->id],
            [
                'choice_index' => $data['choice'],
                'is_correct' => (int) $data['choice'] === $question->correct_index,
            ],
        );

        return back();
    }

    /** "Play again": clears only MY guesses. */
    public function reset(Request $request): RedirectResponse
    {
        QuizGuess::where('user_id', $request->user()->id)->delete();

        return back()->with('status', 'Fresh start. Have fun!');
    }
}