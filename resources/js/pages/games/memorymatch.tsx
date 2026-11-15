import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { getEcho } from '@/lib/echo';

type Card = {
    state: 'hidden' | 'flipped' | 'matched';
    value: string | null;
};

type Game = {
    id: number;
    status: 'active' | 'done';
    cards: Card[];
    pairs_found: number;
    pairs_total: number;
};

type Props = {
    game: Game | null;
    partner: string | null;
    channel: string | null;
};

export default function MemoryMatch({ game, partner, channel }: Props) {
    // Live updates: the ping just tells us to refetch the game.
    useEffect(() => {
        if (!channel) return;

        const ch = getEcho().private(channel);
        ch.listen('.MemoryMatchUpdated', () => {
            router.reload({ only: ['game'] });
        });

        return () => {
            ch.stopListening('.MemoryMatchUpdated');
        };
    }, [channel]);

    const flip = (cell: number) => {
        if (!game) return;
        router.post(
            `/games/memorymatch/${game.id}/flip`,
            { cell },
            { preserveScroll: true, only: ['game'] },
        );
    };

    const newGame = () => {
        router.post('/games/memorymatch', {}, { preserveScroll: true, only: ['game'] });
    };

    return (
        <AppLayout title="Memory match">
            <div className="olu-card mm">
                <h2>Memory match</h2>

                {!partner && <p>Your partner needs an active account to play.</p>}

                {partner && !game && (
                    <>
                        <p>Find all the pairs together with {partner}, no rush.</p>
                        <button className="olu-btn" onClick={newGame}>
                            Start a game
                        </button>
                    </>
                )}

                {partner && game && (
                    <>
                        <p className="mm-status">
                            {game.status === 'done'
                                ? 'You found them all together 🎉'
                                : `${game.pairs_found} of ${game.pairs_total} pairs found 💗`}
                        </p>

                        <div className="mm-board">
                            {game.cards.map((card, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`mm-card ${card.state}`}
                                    disabled={card.state !== 'hidden' || game.status === 'done'}
                                    onClick={() => flip(i)}
                                    aria-label={
                                        card.value ? `Card ${i + 1}: ${card.value}` : `Card ${i + 1}: face down`
                                    }
                                >
                                    {card.value ?? '💗'}
                                </button>
                            ))}
                        </div>

                        <button className="olu-btn" onClick={newGame}>
                            {game.status === 'done' ? 'Play again' : 'New board'}
                        </button>
                    </>
                )}
            </div>
        </AppLayout>
    );
}