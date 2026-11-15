import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '../../layouts/app-layout';
import { countdown, prettyDate, prettyTime, typeInfo } from '../../lib/calendar';
import type { CalendarEvent } from '../../lib/calendar';

type Props = {
    month: string;
    today: string;
    events: CalendarEvent[];
    upcoming: CalendarEvent[];
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n: number) => String(n).padStart(2, '0');

function shiftMonth(month: string, delta: number): string {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function EventRow({ e, when }: { e: CalendarEvent; when?: string }) {
    const t = typeInfo(e.type);

    return (
        <li className="olu-cal-item">
            <span className="olu-cal-item-icon" aria-hidden="true">
                {t.icon}
            </span>
            <div>
                <div className="olu-cal-item-title">{e.title}</div>
                {when && <div className="olu-cal-sub">{when}</div>}
                <div className="olu-cal-sub">
                    {t.label}
                    {e.time ? ` · ${prettyTime(e.time)}` : ''}
                    {e.repeats_yearly ? ' · every year' : ''}
                    {e.mine ? ` · ${e.visibility === 'shared' ? 'shared' : 'private'}` : e.owner ? ` · from ${e.owner}` : ''}
                </div>
                {e.notes && <div className="olu-cal-notes">{e.notes}</div>}
                {e.mine && <Link href={`/calendar/${e.id}/edit`}>Edit</Link>}
            </div>
        </li>
    );
}

export default function CalendarIndex({ month, today, events, upcoming }: Props) {
    const [y, m] = month.split('-').map(Number);
    const [picked, setPicked] = useState<string | null>(today.startsWith(month) ? today : null);
    const selected = picked && picked.startsWith(month) ? picked : null;

    const byDay = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        for (const e of events) {
            (map[e.date] ??= []).push(e);
        }

        return map;
    }, [events]);

    const first = new Date(y, m - 1, 1);
    const daysInMonth = new Date(y, m, 0).getDate();
    const title = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const cells: (number | null)[] = [
        ...Array.from({ length: first.getDay() }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    return (
        <AppLayout title="Calendar">
            <div className="olu-cal-head">
                <h1>{title}</h1>
                <Link href={`/calendar?month=${shiftMonth(month, -1)}`} className="olu-btn" preserveScroll>
                    ‹
                </Link>
                <Link href="/calendar" className="olu-btn" preserveScroll>
                    Today
                </Link>
                <Link href={`/calendar?month=${shiftMonth(month, 1)}`} className="olu-btn" preserveScroll>
                    ›
                </Link>
                <Link href="/calendar/create" className="olu-btn">
                    + New event
                </Link>
            </div>

            <div className="olu-card">
                <div className="olu-cal-grid">
                    {WEEKDAYS.map((d) => (
                        <div key={d} className="olu-cal-dow">
                            {d}
                        </div>
                    ))}

                    {cells.map((day, i) => {
                        if (day === null) {
                            return <div key={`b${i}`} className="olu-cal-day blank" />;
                        }

                        const key = `${month}-${pad(day)}`;
                        const dayEvents = byDay[key] ?? [];

                        return (
                            <button
                                key={key}
                                type="button"
                                className={`olu-cal-day${key === today ? ' today' : ''}${key === selected ? ' selected' : ''}`}
                                onClick={() => setPicked(key === selected ? null : key)}
                            >
                                <span className="olu-cal-num">{day}</span>
                                {dayEvents.length > 0 && (
                                    <span className="olu-cal-icons">
                                        {dayEvents
                                            .slice(0, 3)
                                            .map((e) => typeInfo(e.type).icon)
                                            .join('')}
                                        {dayEvents.length > 3 ? '+' : ''}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selected && (
                <div className="olu-card olu-cal-section">
                    <strong>{prettyDate(selected)}</strong>
                    {(byDay[selected] ?? []).length === 0 ? (
                        <p className="olu-cal-sub">Nothing planned.</p>
                    ) : (
                        <ul className="olu-cal-list">
                            {(byDay[selected] ?? []).map((e) => (
                                <EventRow key={`${e.id}-${e.date}`} e={e} />
                            ))}
                        </ul>
                    )}
                    <p>
                        <Link href={`/calendar/create?date=${selected}`}>+ Add something on this day</Link>
                    </p>
                </div>
            )}

            <div className="olu-card olu-cal-section">
                <strong>Coming up</strong>
                {upcoming.length === 0 ? (
                    <p className="olu-cal-sub">Nothing coming up yet.</p>
                ) : (
                    <ul className="olu-cal-list">
                        {upcoming.map((e) => (
                            <EventRow
                                key={`${e.id}-${e.date}`}
                                e={e}
                                when={`${prettyDate(e.date)} · ${countdown(e.days ?? 0)}`}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}