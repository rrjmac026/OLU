import { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { api } from '../../lib/http';

type Props = {
    total: number;
};

export default function ReasonsIndex({ total }: Props) {
    const [surprise, setSurprise] = useState<string | null>(null);
    const [revealed, setRevealed] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    async function surpriseMe() {
        setLoading(true);
        try {
            const res = await api<{ body: string | null }>(
                'GET',
                `/content/random/reason${surprise ? `?exclude=${encodeURIComponent(surprise)}` : ''}`,
            );
            const body = res.body;
            if (body) {
                setSurprise(body);
                setRevealed((prev) => (prev.includes(body) ? prev : [body, ...prev]));
            }
        } catch {
            // keep the current one
        } finally {
            setLoading(false);
        }
    }

    return (
        <AppLayout title="Reasons">
            <div className="rs">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <Heart size={16} aria-hidden="true" /> Reasons
                        </span>
                        <h1 className="jr-title">
                            Reasons I <span>love you</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">A list that keeps growing, just like us.</p>
                    </div>
                    <div className="mu-stats">
                        <div>
                            <strong>{total}</strong>
                            <small>{total === 1 ? 'reason' : 'reasons'}</small>
                        </div>
                    </div>
                </section>

                {total === 0 ? (
                    <section className="home-panel">
                        <div className="jr-empty">
                            <span aria-hidden="true">💗</span>
                            <strong>Nothing here yet</strong>
                            <small>This list grows over time.</small>
                        </div>
                    </section>
                ) : (
                    <>
                        <section className="home-panel rs-surprise">
                            <div className="home-panel-head">
                                <h2>
                                    <Sparkles size={18} aria-hidden="true" /> Surprise me
                                </h2>
                            </div>

                            <blockquote className={`rs-quote${surprise ? ' on' : ''}`} key={surprise ?? 'empty'}>
                                {surprise ?? 'Press the button to see one of my reasons…'}
                            </blockquote>

                            <button type="button" className="home-btn" onClick={surpriseMe} disabled={loading}>
                                {loading ? '…' : surprise ? 'Another one ♡' : 'Surprise me ♡'}
                            </button>
                        </section>

                        {revealed.length > 0 && (
                            <>
                                <h2 className="rs-heading">
                                    Revealed so far · {revealed.length} of {total}
                                </h2>
                                <ol className="rs-grid">
                                    {revealed.map((body, i) => (
                                        <li key={body} className="rs-card">
                                            <span className="rs-num">{revealed.length - i}</span>
                                            <p>{body}</p>
                                        </li>
                                    ))}
                                </ol>
                            </>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}