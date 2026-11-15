import { useState } from 'react';
import AppLayout from '../../layouts/app-layout';
import { api } from '../../lib/http';

type Props = {
    reasons: { id: number; body: string }[];
};

export default function ReasonsIndex({ reasons }: Props) {
    const [surprise, setSurprise] = useState<string | null>(null);

    async function surpriseMe() {
        try {
            const res = await api<{ body: string | null }>(
                'GET',
                `/content/random/reason${surprise ? `?exclude=${encodeURIComponent(surprise)}` : ''}`,
            );
            if (res.body) setSurprise(res.body);
        } catch {
            // keep the current one
        }
    }

    return (
        <AppLayout title="Reasons">
            <h1>Reasons I love you</h1>

            {reasons.length === 0 ? (
                <div className="olu-card">
                    <p className="olu-muted">Nothing here yet. This list grows over time.</p>
                </div>
            ) : (
                <>
                    <div className="olu-card olu-comfort">
                        {surprise && <blockquote className="olu-comfort-msg">{surprise}</blockquote>}
                        <button type="button" className="olu-btn" onClick={surpriseMe}>
                            {surprise ? 'Another one' : 'Surprise me'}
                        </button>
                    </div>

                    <ol className="olu-reasons">
                        {reasons.map((r) => (
                            <li key={r.id}>{r.body}</li>
                        ))}
                    </ol>
                </>
            )}
        </AppLayout>
    );
}