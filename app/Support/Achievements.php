<?php

namespace App\Support;

use App\Models\MemoryMatchGame;
use App\Models\PuzzleResult;
use App\Models\TicTacToeGame;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Support\Facades\DB;

class Achievements
{
    public const ALL = [
        'first_answer' => ['emoji' => '💬', 'title' => 'Getting to know you', 'description' => 'Answer a daily question'],
        'answers_10' => ['emoji' => '🌷', 'title' => 'Curious hearts', 'description' => 'Answer 10 daily questions in total'],
        'first_puzzle' => ['emoji' => '🧩', 'title' => 'Puzzle solver', 'description' => 'Solve a daily puzzle'],
        'puzzles_5' => ['emoji' => '🧠', 'title' => 'Riddle fan', 'description' => 'Solve 5 daily puzzles in total'],
        'first_ttt' => ['emoji' => '⭕', 'title' => 'First round', 'description' => 'Finish a game of tic-tac-toe'],
        'ttt_win' => ['emoji' => '🏆', 'title' => 'Three in a row', 'description' => 'Win a game of tic-tac-toe'],
        'first_board' => ['emoji' => '🃏', 'title' => 'Pair finders', 'description' => 'Complete a memory match board together'],
        'boards_3' => ['emoji' => '🌟', 'title' => 'Great minds', 'description' => 'Complete 3 memory match boards together'],
    ];

    /** Unlock anything newly earned. Nothing is ever removed. */
    public static function sync(User $user): void
    {
        $id = $user->id;

        $answers = DB::table('daily_answers')->where('user_id', $id)->count();
        $solved = PuzzleResult::where('user_id', $id)->where('outcome', 'solved')->count();
        $tttDone = TicTacToeGame::involving($user)->where('status', '!=', 'active')->count();
        $tttWins = TicTacToeGame::where('winner_id', $id)->count();
        $boards = MemoryMatchGame::involving($user)->where('status', 'done')->count();

        $earned = [
            'first_answer' => $answers >= 1,
            'answers_10' => $answers >= 10,
            'first_puzzle' => $solved >= 1,
            'puzzles_5' => $solved >= 5,
            'first_ttt' => $tttDone >= 1,
            'ttt_win' => $tttWins >= 1,
            'first_board' => $boards >= 1,
            'boards_3' => $boards >= 3,
        ];

        foreach ($earned as $key => $ok) {
            if ($ok) {
                UserAchievement::firstOrCreate(
                    ['user_id' => $id, 'key' => $key],
                    ['unlocked_at' => now()],
                );
            }
        }
    }
}