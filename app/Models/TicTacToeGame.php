<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class TicTacToeGame extends Model
{
    protected $table = 'tictactoe_games';

    protected $fillable = [
        'x_user_id', 'o_user_id', 'board', 'turn', 'status', 'winner_id',
    ];

    public const LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];

    /** Only games the user plays in. Non-players get a 404 via firstOrFail. */
    public function scopeInvolving(Builder $query, User $user): Builder
    {
        return $query->where(function ($w) use ($user) {
            $w->where('x_user_id', $user->id)->orWhere('o_user_id', $user->id);
        });
    }

    public function symbolFor(User $user): ?string
    {
        return match ($user->id) {
            $this->x_user_id => 'X',
            $this->o_user_id => 'O',
            default => null,
        };
    }

    public static function winningLine(string $board): ?array
    {
        foreach (self::LINES as [$a, $b, $c]) {
            if ($board[$a] !== '-' && $board[$a] === $board[$b] && $board[$a] === $board[$c]) {
                return [$a, $b, $c];
            }
        }

        return null;
    }
}