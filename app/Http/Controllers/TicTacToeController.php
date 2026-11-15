<?php

namespace App\Http\Controllers;

use App\Events\TicTacToeUpdated;
use App\Models\TicTacToeGame;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TicTacToeController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();
        $partner = $this->partnerOf($me);
        $game = TicTacToeGame::involving($me)->latest('id')->first();

        return Inertia::render('games/tictactoe', [
            'game' => $game ? $this->payload($game, $me) : null,
            'partner' => $partner ? $this->nameOf($partner) : null,
            'channel' => $partner
                ? 'tictactoe.'.min($me->id, $partner->id).'.'.max($me->id, $partner->id)
                : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $me = $request->user();
        $partner = $this->partnerOf($me);
        abort_unless($partner, 404);

        $last = TicTacToeGame::involving($me)->latest('id')->first();

        // First game: you are X. After that, the starting player swaps.
        [$x, $o] = $last
            ? [$last->o_user_id, $last->x_user_id]
            : [$me->id, $partner->id];

        $game = TicTacToeGame::create([
            'x_user_id' => $x,
            'o_user_id' => $o,
        ]);

        $this->ping($game);

        return back();
    }

    public function move(Request $request, int $game): RedirectResponse
    {
        $me = $request->user();
        $cell = $request->validate([
            'cell' => ['required', 'integer', 'between:0,8'],
        ])['cell'];

        $updated = DB::transaction(function () use ($me, $game, $cell) {
            $g = TicTacToeGame::involving($me)->whereKey($game)->lockForUpdate()->firstOrFail();

            abort_unless($g->status === 'active', 422);
            abort_unless($g->turn === $g->symbolFor($me), 403);
            abort_unless($g->board[$cell] === '-', 422);

            $board = $g->board;
            $board[$cell] = $g->turn;
            $g->board = $board;

            if (TicTacToeGame::winningLine($board)) {
                $g->status = 'won';
                $g->winner_id = $me->id;
            } elseif (! str_contains($board, '-')) {
                $g->status = 'draw';
            } else {
                $g->turn = $g->turn === 'X' ? 'O' : 'X';
            }

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

    private function nameOf(User $user): string
    {
        return $user->profile?->display_name ?: $user->name;
    }

    private function payload(TicTacToeGame $g, User $me): array
    {
        $mine = $g->symbolFor($me);

        return [
            'id' => $g->id,
            'board' => str_split($g->board),
            'you' => $mine,
            'status' => $g->status,
            'your_turn' => $g->status === 'active' && $g->turn === $mine,
            'winner' => $g->winner_id ? ($g->winner_id === $me->id ? 'you' : 'partner') : null,
            'line' => $g->status === 'won' ? TicTacToeGame::winningLine($g->board) : null,
        ];
    }

    private function ping(TicTacToeGame $g): void
    {
        broadcast(new TicTacToeUpdated(
            min($g->x_user_id, $g->o_user_id),
            max($g->x_user_id, $g->o_user_id),
        ));
    }
}