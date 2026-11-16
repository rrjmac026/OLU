<?php

namespace App\Support;

use App\Models\MemoryMatchGame;
use App\Models\PuzzleResult;
use App\Models\TicTacToeGame;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class Garden
{
    /** Total drops this person has ever earned (counted lazily, nothing expires). */
    public static function earned(User $user): int
    {
        return DB::table('daily_answers')->where('user_id', $user->id)->count()
            + PuzzleResult::where('user_id', $user->id)->count()
            + TicTacToeGame::involving($user)->where('status', '!=', 'active')->count()
            + MemoryMatchGame::involving($user)->where('status', 'done')->count();
    }

    public static function available(User $user, int $spent): int
    {
        return max(0, self::earned($user) - $spent);
    }

    public static function enabled(User $user): bool
    {
        return (bool) ($user->settings?->gamification_enabled ?? true);
    }
}