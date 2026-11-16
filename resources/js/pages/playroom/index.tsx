import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Game = {
    href: string;
    icon: string;
    title: string;
    blurb: string;
};

const games: Game[] = [
    { href: '/quiz', icon: '💞', title: 'Couple quiz', blurb: 'How well do you know each other?' },
    { href: '/wheel', icon: '🎡', title: 'Random wheel', blurb: 'Date ideas, challenges and little treats.' },
    { href: '/games/tictactoe', icon: '⭕', title: 'Tic-tac-toe', blurb: 'A relaxed game, live together.' },
    { href: '/games/memorymatch', icon: '🃏', title: 'Memory match', blurb: 'Find all the pairs as a team.' },
    { href: '/puzzle', icon: '🧩', title: 'Daily puzzle', blurb: 'A new riddle every day.' },
    { href: '/achievements', icon: '🏅', title: 'Achievements', blurb: 'Little badges, no pressure.' },
];

export default function Playroom() {
    return (
        <AppLayout title="Playroom">
            <div className="olu-card playroom">
                <h2>Playroom 🎈</h2>
                <p className="playroom-intro">Play whenever you feel like it. Nothing here is a chore.</p>

                <div className="playroom-grid">
                    {games.map((game) => (
                        <Link key={game.href} href={game.href} className="playroom-tile">
                            <span className="playroom-icon">{game.icon}</span>
                            <strong>{game.title}</strong>
                            <span className="playroom-blurb">{game.blurb}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}