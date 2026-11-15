import { Link } from '@inertiajs/react';
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
            <div className="olu-cal-head">
                <h1>Our timeline</h1>
                <Link href="/timeline/create" className="olu-btn">
                    + New moment
                </Link>
            </div>

            {groups.length === 0 && (
                <div className="olu-card">
                    <p className="olu-muted">No moments yet. Add the first one, like the day it all started.</p>
                </div>
            )}

            {groups.map((g) => (
                <section key={g.year} className="olu-tl-year">
                    <h2>{g.year}</h2>
                    <ul className="olu-tl-list">
                        {g.items.map((m) => (
                            <li key={m.id} className="olu-tl-item">
                                <div className="olu-tl-date">{prettyDate(m.date)}</div>
                                <div className="olu-tl-title">{m.title}</div>
                                {m.story && <div className="olu-tl-story">{m.story}</div>}
                                <div className="olu-cal-sub">
                                    {m.mine
                                        ? m.visibility === 'shared'
                                            ? 'shared'
                                            : 'private'
                                        : m.owner
                                          ? `from ${m.owner}`
                                          : ''}
                                </div>
                                {m.mine && <Link href={`/timeline/${m.id}/edit`}>Edit</Link>}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </AppLayout>
    );
}