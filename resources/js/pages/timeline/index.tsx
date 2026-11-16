import { Link } from '@inertiajs/react';
import { Heart, Lock, Pencil, Plus, Users } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { prettyDate } from '../../lib/calendar';
import type { Moment } from '../../lib/timeline';

type Props = {
    moments: Moment[];
};

export default function TimelineIndex({ moments }: Props) {
    // already sorted newest first, so years are contiguous
    const groups: { year: string; items: Moment[] }[] = [];
    for (const m of moments) {
        const year = m.date.slice(0, 4);
        const last = groups[groups.length - 1];
        if (last && last.year === year) {
            last.items.push(m);
        } else {
            groups.push({ year, items: [m] });
        }
    }

    return (
        <AppLayout title="Our timeline">
            <div className="tl">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <Heart size={16} aria-hidden="true" /> Timeline
                        </span>
                        <h1 className="jr-title">
                            Our <span>timeline</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Every little step of our story.</p>
                    </div>
                    <div className="me-hero-side">
                        <div className="mu-stats">
                            <div>
                                <strong>{moments.length}</strong>
                                <small>{moments.length === 1 ? 'moment' : 'moments'}</small>
                            </div>
                            <div>
                                <strong>{groups.length}</strong>
                                <small>{groups.length === 1 ? 'year' : 'years'}</small>
                            </div>
                        </div>
                        <Link href="/timeline/create" className="home-btn jr-new">
                            <Plus size={18} aria-hidden="true" /> New moment
                        </Link>
                    </div>
                </section>

                {groups.length === 0 && (
                    <section className="home-panel">
                        <div className="jr-empty">
                            <span aria-hidden="true">🌌</span>
                            <strong>No moments yet</strong>
                            <small>Add the first one, like the day it all started.</small>
                            <Link href="/timeline/create" className="home-btn">
                                Add the first moment
                            </Link>
                        </div>
                    </section>
                )}

                {groups.map((g) => (
                    <section key={g.year} className="tl-year">
                        <div className="tl-year-label">{g.year}</div>
                        <ol className="tl-list">
                            {g.items.map((m) => (
                                <li key={m.id} className="tl-item">
                                    <span className="tl-dot" aria-hidden="true" />
                                    <article className="tl-card">
                                        <div className="tl-card-top">
                                            <span className="tl-date">{prettyDate(m.date)}</span>
                                            {m.mine ? (
                                                <span className="ci-chip jr-chip">
                                                    {m.visibility === 'shared' ? (
                                                        <>
                                                            <Users size={11} aria-hidden="true" /> Shared
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock size={11} aria-hidden="true" /> Private
                                                        </>
                                                    )}
                                                </span>
                                            ) : (
                                                m.owner && <span className="ci-chip">from {m.owner} ♡</span>
                                            )}
                                        </div>
                                        <h3 className="tl-title">{m.title}</h3>
                                        {m.story && <p className="tl-story">{m.story}</p>}
                                        {m.mine && (
                                            <Link href={`/timeline/${m.id}/edit`} className="tl-edit">
                                                <Pencil size={13} aria-hidden="true" /> Edit
                                            </Link>
                                        )}
                                    </article>
                                </li>
                            ))}
                        </ol>
                    </section>
                ))}
            </div>
        </AppLayout>
    );
}