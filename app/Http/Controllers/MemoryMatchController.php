<?php

namespace App\Http\Controllers;

use App\Events\MemoryMatchUpdated;
use App\Models\MemoryMatchGame;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MemoryMatchController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();
        $partner = $this->partnerOf($me);
        $game = MemoryMatchGame::involving($me)->latest('id')->first();

        return Inertia::render('games/memorymatch', [
            'game' => $game ? $this->payload($game) : null,
            'partner' => $partner ? ($partner->profile?->display_name ?: $partner->name) : null,
            'channel' => $partner
                ? 'memorymatch.'.min($me->id, $partner->id).'.'.max($me->id, $partner->id)
                : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $me = $request->user();
        $partner = $this->partnerOf($me);
        abort_unless($partner, 404);

        $game = MemoryMatchGame::create([
            'user_a_id' => min($me->id, $partner->id),
            'user_b_id' => max($me->id, $partner->id),
            'deck' => MemoryMatchGame::newDeck(),
            'matched' => [],
            'flipped' => [],
        ]);

        $this->ping($game);

        return back();
    }

    public function flip(Request $request, int $game): RedirectResponse
    {
        $me = $request->user();
        $cell = $request->validate([
            'cell' => ['required', 'integer', 'between:0,15'],
        ])['cell'];

        $updated = DB::transaction(function () use ($me, $game, $cell) {
            $g = MemoryMatchGame::involving($me)->whereKey($game)->lockForUpdate()->firstOrFail();

            abort_unless($g->status === 'active', 422);

            $matched = $g->matched;
            $flipped = $g->flipped;

            abort_if(in_array($cell, $matched, true), 422);
            abort_if(in_array($cell, $flipped, true), 422);

            // A wrong pair was left face up: hide it before the next flip.
            if (count($flipped) === 2) {
                $flipped = [];
            }

            $flipped[] = $cell;

            if (count($flipped) === 2) {
                [$first, $second] = $flipped;

                if ($g->deck[$first] === $g->deck[$second]) {
                    $matched = array_values(array_merge($matched, $flipped));
                    $flipped = [];
                }
            }

            if (count($matched) === count($g->deck)) {
                $g->status = 'done';
            }

            $g->matched = $matched;
            $g->flipped = $flipped;
            $g->save();

            return $g;
        });

        $this->ping($updated);

        return back();
    }

    private function partnerOf(User $me): ?User
    {
        return User::query()
            ->where('is_active', true)
            ->whereKeyNot($me->id)
            ->with('profile')
            ->first();
    }

    /** Only face-up and matched cards reveal their emoji. */
    private function payload(MemoryMatchGame $g): array
    {
        $cards = [];

        foreach ($g->deck as $i => $symbol) {
            $isMatched = in_array($i, $g->matched, true);
            $isFlipped = in_array($i, $g->flipped, true);

            $cards[] = [
                'state' => $isMatched ? 'matched' : ($isFlipped ? 'flipped' : 'hidden'),
                'value' => ($isMatched || $isFlipped) ? $symbol : null,
            ];
        }

        return [
            'id' => $g->id,
            'status' => $g->status,
            'cards' => $cards,
            'pairs_found' => intdiv(count($g->matched), 2),
            'pairs_total' => intdiv(count($g->deck), 2),
        ];
    }

    private function ping(MemoryMatchGame $g): void
    {
        broadcast(new MemoryMatchUpdated($g->user_a_id, $g->user_b_id));
    }
}