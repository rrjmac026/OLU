import { Link, usePage } from '@inertiajs/react';
import AppLayout from '../layouts/app-layout';
import { moodInfo } from '../lib/moods';
import type { SharedProps } from '../types/olu';

type Props = {
    checkin_today: { mood: string } | null;
};

export default function Home({ checkin_today }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const name = auth.user?.display_name ?? auth.user?.name ?? '';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const mood = checkin_today ? moodInfo(checkin_today.mood) : null;

    return (
        <AppLayout title="Home">
            <div className="olu-card">
                <h2>
                    {greeting}, {name}!
                </h2>
                <p className="olu-muted">Your little corner is waiting for you.</p>
            </div>
            <div className="olu-grid">
                <Link href="/checkins" className="olu-tile">
                    {mood ? (
                        <>
                            {mood.emoji} Today: {mood.label}
                        </>
                    ) : (
                        <>Check in whenever you like</>
                    )}
                </Link>
                <div className="olu-tile">Playroom (soon)</div>
                <div className="olu-tile">Inbox (soon)</div>
                <div className="olu-tile">Garden (soon)</div>
            </div>
        </AppLayout>
    );
}