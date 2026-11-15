import { useState } from 'react';
import AppLayout from '../../layouts/app-layout';
import { api } from '../../lib/http';

export default function ComfortIndex() {
    const [message, setMessage] = useState<string | null>(null);
    const [empty, setEmpty] = useState(false);
    const [loading, setLoading] = useState(false);

    async function reveal() {
        setLoading(true);
        try {
            const res = await api<{ body: string | null }>(
                'GET',
                `/content/random/comfort${message ? `?exclude=${encodeURIComponent(message)}` : ''}`,
            );
            setEmpty(res.body === null);
            setMessage(res.body);
        } catch {
            setMessage(null);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AppLayout title="Comfort corner">
            <h1>Comfort corner</h1>
            <div className="olu-card olu-comfort">
                <p className="olu-muted">For the days that feel heavy. Open it only when you want to.</p>

                {message && <blockquote className="olu-comfort-msg">{message}</blockquote>}
                {empty && <p className="olu-muted">Nothing here yet.</p>}

                <button type="button" className="olu-btn" onClick={reveal} disabled={loading}>
                    {message ? 'Another one' : 'I could use a little comfort'}
                </button>
            </div>
        </AppLayout>
    );
}