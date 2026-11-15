import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../layouts/app-layout';
import { countdown, typeInfo } from '../lib/calendar';
import type { CalendarEvent } from '../lib/calendar';
import { api } from '../lib/http';
import { moodInfo } from '../lib/moods';
import type { SharedProps } from '../types/olu';

type Props = {
    checkin_today: { mood: string } | null;
    next_event: CalendarEvent | null;
    daily_compliment: string | null;
    daily_question: string | null;
    question_answered: boolean;
};

export default function Home({ checkin_today, next_event, daily_compliment, daily_question, question_answered }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const name = auth.user?.display_name ?? auth.user?.name ?? '';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const mood = checkin_today ? moodInfo(checkin_today.mood) : null;

    const [compliment, setCompliment] = useState(daily_compliment);

    async function another() {
        try {
            const res = await api<{ body: string | null }>(
                'GET',
                `/content/random/compliment${compliment ? `?exclude=${encodeURIComponent(compliment)}` : ''}`,
            );
            if (res.body) setCompliment(res.body);
        } catch {
            // keep showing the current one
        }
    }

    return (
        <AppLayout title="Home">
            <div className="olu-card">
                <h2>
                    {greeting}, {name}!
                </h2>
                <p className="olu-muted">Your little corner is waiting for you.</p>
                {compliment && (
                    <p>
                        Today&apos;s reminder: &ldquo;{compliment}&rdquo;{' '}
                        <button type="button" className="olu-linkbtn" onClick={another}>
                            Another one
                        </button>
                    </p>
                )}
            </div>

            {daily_question && (
                <div className="olu-card">
                    <strong>Question of the day</strong>
                    <p>{daily_question}</p>
                    <Link href="/questions" className="olu-linkbtn">
                        {question_answered ? 'View your answer' : 'Answer it'}
                    </Link>
                </div>
            )}

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
                {next_event ? (
                    <Link href="/calendar" className="olu-tile">
                        {typeInfo(next_event.type).icon} {next_event.title} {countdown(next_event.days ?? 0)}
                    </Link>
                ) : (
                    <Link href="/calendar/create" className="olu-tile">
                        📅 Add a special date
                    </Link>
                )}
                <Link href="/comfort" className="olu-tile">
                    🫶 Comfort corner
                </Link>
                <Link href="/quiz" className="olu-tile">
                    🎮 Couple quiz
                </Link>
                <div className="olu-tile">Inbox (soon)</div>
                <div className="olu-tile">Garden (soon)</div>
            </div>
        </AppLayout>
    );
}