import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { getEcho } from '@/lib/echo';

type Game = {
    id: number;
    board: string[];
    you: 'X' | 'O';
    status: 'active' | 'won' | 'draw';
    your_turn: boolean;
    winner: 'you' | 'partner' | null;
    line: number[] | null;
};

type Props = {
    game: Game | null;
    partner: string | null;
    channel: string | null;
};

function statusText(game: Game, partner: string): string {
    if (game.status === 'won') {
        return game.winner === 'you' ? 'You won! 🎉' : `${partner} won this one 💗`;
    }
    if (game.status === 'draw') return 'A draw, nicely played 🤍';
    return game.your_turn ? 'Your turn 💗' : `Waiting for ${partner}…`;
}

export default function TicTacToe({ game, partner, channel }: Props) {
    // Live updates: the ping just tells us to refetch the game.
    useEffect(() => {
        if (!channel) return;

        const ch = getEcho().private(channel);
        ch.listen('.TicTacToeUpdated', () => {
            router.reload({ only: ['game'] });
        });

        return () => {
            ch.stopListening('.TicTacToeUpdated');
        };
    }, [channel]);

    const play = (cell: number) => {
        if (!game) return;
        router.post(
            `/games/tictactoe/${game.id}/move`,
            { cell },
            { preserveScroll: true, only: ['game'] },
        );
    };

    const newGame = () => {
        router.post('/games/tictactoe', {}, { preserveScroll: true, only: ['game'] });
    };

    return (
        <AppLayout title="Tic-tac-toe">
            <div className="olu-card ttt">
                <h2>Tic-tac-toe</h2>

                {!partner && <p>Your partner needs an active account to play.</p>}

                {partner && !game && (
                    <>
                        <p>No game yet. Start one whenever you like.</p>
                        <button className="olu-btn" onClick={newGame}>
                            Start a game
                        </button>
                    </>
                )}

                {partner && game && (
                    <>
                        <p className="ttt-status">{statusText(game, partner)}</p>
                        <p className="ttt-you">You are {game.you}</p>

                        <div className="ttt-board">
                            {game.board.map((value, i) => {
                                const empty = value === '-';
                                const win = game.line?.includes(i);
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        className={`ttt-cell${win ? ' win' : ''}`}
                                        disabled={!empty || !game.your_turn}
                                        onClick={() => play(i)}
                                        aria-label={`Cell ${i + 1}: ${empty ? 'empty' : value}`}
                                    >
                                        {empty ? '' : value}
                                    </button>
                                );
                            })}
                        </div>

                        <button className="olu-btn" onClick={newGame}>
                            {game.status === 'active' ? 'Restart' : 'Play again'}
                        </button>
                    </>
                )}
            </div>
        </AppLayout>
    );
}