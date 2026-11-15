import { usePage } from '@inertiajs/react';
import AppLayout from '../layouts/app-layout';
import type { SharedProps } from '../types/olu';

export default function Home() {
    const { auth } = usePage<SharedProps>().props;
    const name = auth.user?.display_name ?? auth.user?.name ?? '';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <AppLayout title="Home">
            <div className="olu-card">
                <h2>
                    {greeting}, {name}!
                </h2>
                <p className="olu-muted">Your little corner is waiting for you.</p>
            </div>
            <div className="olu-grid">
                <div className="olu-tile">Daily check-in (soon)</div>
                <div className="olu-tile">Playroom (soon)</div>
                <div className="olu-tile">Inbox (soon)</div>
                <div className="olu-tile">Garden (soon)</div>
            </div>
        </AppLayout>
    );
}