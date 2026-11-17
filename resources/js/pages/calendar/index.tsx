import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import AppLayout from '../../layouts/app-layout';
import { countdown, parseYmd, prettyDate, prettyTime, typeInfo } from '../../lib/calendar';
import type { CalendarEvent } from '../../lib/calendar';
import '../../../css/calendar.css'; // adjust path to wherever you put calendar.css

type Props = {
    month: string;
    today: string;
    events: CalendarEvent[];
    upcoming: CalendarEvent[];
};

type View = 'month' | 'week' | 'agenda';

/* ---------- tiny inline icons (no extra deps) ---------- */
function S({ children, fill, className }: { children: ReactNode; fill?: boolean; className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill={fill ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const STAR = 'M12 2.5l2.8 6.3 6.7.7-5 4.6 1.5 6.9-6-3.5-6 3.5 1.5-6.9-5-4.6 6.7-.7z';
const I = {
    left: (
        <S>
            <path d="M15 18l-6-6 6-6" />
        </S>
    ),
    right: (
        <S>
            <path d="M9 18l6-6-6-6" />
        </S>
    ),
    cal: (
        <S>
            <rect x="3" y="5" width="18" height="16" rx="3" fill="currentColor" fillOpacity=".25" />
            <path d="M8 3v4M16 3v4M3 10h18" />
        </S>
    ),
    sun: (
        <S>
            <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity=".55" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </S>
    ),
    star: (
        <S fill>
            <path d={STAR} />
        </S>
    ),
    grid: (
        <S>
            <rect x="3" y="3" width="7" height="7" rx="1.6" fill="currentColor" fillOpacity=".4" />
            <rect x="14" y="3" width="7" height="7" rx="1.6" fill="currentColor" fillOpacity=".4" />
            <rect x="3" y="14" width="7" height="7" rx="1.6" fill="currentColor" fillOpacity=".4" />
            <rect x="14" y="14" width="7" height="7" rx="1.6" fill="currentColor" fillOpacity=".4" />
        </S>
    ),
    week: (
        <S>
            <rect x="3" y="4" width="18" height="16" rx="2.5" fill="currentColor" fillOpacity=".25" />
            <path d="M9 4v16M15 4v16" />
        </S>
    ),
    list: (
        <S>
            <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
        </S>
    ),
    bolt: (
        <S fill>
            <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
        </S>
    ),
    plus: (
        <S>
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".25" />
            <path d="M12 8v8M8 12h8" />
        </S>
    ),
    resched: (
        <S>
            <rect x="3" y="5" width="18" height="16" rx="3" fill="currentColor" fillOpacity=".25" />
            <path d="M8 3v4M16 3v4M3 10h18" />
            <circle cx="17" cy="17" r="4.2" fill="#3a1250" />
            <path d="M17 14.8v2.4l1.6 1" />
        </S>
    ),
    heart: (
        <S>
            <path d="M12 21s-7-4.5-9.3-9A5.3 5.3 0 0112 6a5.3 5.3 0 019.3 6c-2.3 4.5-9.3 9-9.3 9z" />
        </S>
    ),
    heartFill: (
        <S fill>
            <path d="M12 21s-7-4.5-9.3-9A5.3 5.3 0 0112 6a5.3 5.3 0 019.3 6c-2.3 4.5-9.3 9-9.3 9z" />
        </S>
    ),
    clock: (
        <S>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </S>
    ),
};

/* ---------- hero scene: night sky, moon, stars, clouds, sleeping cat ---------- */
function HeroScene() {
    const star = 'M0-12L3.5-4 12-3.5 5.5 2.5 7.5 11 0 6.5-7.5 11-5.5 2.5-12-3.5-3.5-4Z';

    return (
        <svg className="cl-scene" viewBox="0 0 620 165" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
            <defs>
                <linearGradient id="clTrail" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#ffd9f3" stopOpacity=".9" />
                </linearGradient>
                <linearGradient id="clMoon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffe3ac" />
                    <stop offset="1" stopColor="#ff9fcb" />
                </linearGradient>
                <linearGradient id="clStar" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffeaa0" />
                    <stop offset="1" stopColor="#ffb3d9" />
                </linearGradient>
                <linearGradient id="clCat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#e3cdfb" />
                    <stop offset="1" stopColor="#b896ec" />
                </linearGradient>
                <filter id="clBlur" x="-20%" y="-50%" width="140%" height="200%">
                    <feGaussianBlur stdDeviation="7" />
                </filter>
                <filter id="clGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <mask id="clMoonMask">
                    <rect width="620" height="165" fill="#fff" />
                    <circle cx="590" cy="36" r="32" fill="#000" />
                </mask>
            </defs>

            {/* shooting-star trail */}
            <path d="M-20 178 Q 200 80 470 -6" stroke="url(#clTrail)" strokeWidth="1.6" fill="none" />

            {/* back clouds */}
            <g filter="url(#clBlur)">
                <ellipse cx="120" cy="168" rx="150" ry="26" fill="#c77be6" opacity=".7" />
                <ellipse cx="340" cy="172" rx="170" ry="28" fill="#ff9ad7" opacity=".6" />
                <ellipse cx="560" cy="158" rx="110" ry="30" fill="#b86be2" opacity=".75" />
            </g>

            {/* moon */}
            <circle cx="568" cy="52" r="36" fill="url(#clMoon)" mask="url(#clMoonMask)" filter="url(#clGlow)" />

            {/* stars + sparkles */}
            <path d={star} transform="translate(255 52) scale(1.35)" fill="url(#clStar)" filter="url(#clGlow)" />
            <path d={star} transform="translate(348 100) scale(1.15)" fill="url(#clStar)" filter="url(#clGlow)" />
            <path d={star} transform="translate(603 128) scale(1.05)" fill="url(#clStar)" filter="url(#clGlow)" />
            <g fill="#fff">
                <circle cx="195" cy="40" r="1.6" />
                <circle cx="300" cy="22" r="1.2" />
                <circle cx="420" cy="30" r="1.8" />
                <circle cx="505" cy="100" r="1.3" />
                <circle cx="150" cy="95" r="1.4" />
                <circle cx="450" cy="12" r="1.2" />
            </g>

            {/* sleeping cat */}
            <g transform="translate(300 50)">
                <path d="M235 80 C 264 82, 270 50, 244 44" stroke="url(#clCat)" strokeWidth="16" strokeLinecap="round" fill="none" />
                <ellipse cx="150" cy="82" rx="96" ry="32" fill="url(#clCat)" />
                <ellipse cx="205" cy="90" rx="34" ry="22" fill="#c9a8f2" />
                <path d="M160 52q6 14 0 26M184 56q6 14 0 24M208 62q5 10 0 20" stroke="#a37fdc" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M42 40L46 6 76 28Z" fill="#dcc2f8" />
                <path d="M51 34L53 17 67 28Z" fill="#ffb3d1" />
                <path d="M96 26L118 4 122 42Z" fill="#dcc2f8" />
                <path d="M105 28L116 14 117 36Z" fill="#ffb3d1" />
                <circle cx="80" cy="62" r="40" fill="#e6d3fc" />
                <path d="M72 26v10M82 24v12M92 26v10" stroke="#a37fdc" strokeWidth="3" strokeLinecap="round" />
                <path d="M57 64q9 8 18 0M89 64q9 8 18 0" stroke="#4a2a7a" strokeWidth="3" strokeLinecap="round" fill="none" />
                <ellipse cx="53" cy="78" rx="9" ry="5" fill="#ff9fc8" opacity=".75" />
                <ellipse cx="113" cy="78" rx="9" ry="5" fill="#ff9fc8" opacity=".75" />
                <path d="M76 75h10l-5 5z" fill="#ff8fb8" />
                <path d="M81 80q-5 6-10 2M81 80q5 6 10 2" stroke="#4a2a7a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <ellipse cx="74" cy="104" rx="18" ry="9" fill="#e6d3fc" />
            </g>

            {/* front cloud */}
            <g filter="url(#clBlur)">
                <ellipse cx="430" cy="170" rx="180" ry="18" fill="#ffa3dc" opacity=".65" />
            </g>
        </svg>
    );
}

const WEEKDAYS = [
    { label: 'Sun', icon: I.sun },
    { label: 'Mon', icon: I.cal },
    { label: 'Tue', icon: I.cal },
    { label: 'Wed', icon: I.cal },
    { label: 'Thu', icon: I.cal },
    { label: 'Fri', icon: I.cal },
    { label: 'Sat', icon: I.star },
];
const VIEWS: { key: View; label: string; icon: ReactNode }[] = [
    { key: 'month', label: 'Month', icon: I.grid },
    { key: 'week', label: 'Week', icon: I.week },
    { key: 'agenda', label: 'Agenda', icon: I.list },
];

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shortDate = (s: string) =>
    parseYmd(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

function shiftMonth(month: string, delta: number): string {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function EventRow({ e, when }: { e: CalendarEvent; when?: string }) {
    const t = typeInfo(e.type);

    return (
        <li className="cl-item">
            <span className="cl-item-icon" aria-hidden="true">
                {t.icon}
            </span>
            <div>
                <div className="cl-item-title">{e.title}</div>
                {when && <div className="cl-muted">{when}</div>}
                <div className="cl-muted">
                    {t.label}
                    {e.time ? ` · ${prettyTime(e.time)}` : ''}
                    {e.repeats_yearly ? ' · every year' : ''}
                    {e.mine ? ` · ${e.visibility === 'shared' ? 'shared' : 'private'}` : e.owner ? ` · from ${e.owner}` : ''}
                </div>
                {e.notes && <div className="cl-item-notes">{e.notes}</div>}
                {e.mine && (
                    <Link href={`/calendar/${e.id}/edit`} className="cl-link">
                        Edit
                    </Link>
                )}
            </div>
        </li>
    );
}

export default function CalendarIndex({ month, today, events, upcoming }: Props) {
    const [y, m] = month.split('-').map(Number);
    const [view, setView] = useState<View>('month');
    const [picked, setPicked] = useState<string | null>(null);
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
    const title = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const cells: (number | null)[] = [
        ...Array.from({ length: first.getDay() }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    // week view: the week containing the selected day (or today / the 1st)
    const weekDays = useMemo(() => {
        const anchor = parseYmd(selected ?? (today.startsWith(month) ? today : `${month}-01`));
        const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - anchor.getDay());

        return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }, [selected, today, month]);

    const agendaDays = Object.keys(byDay).sort();
    const nextMine = upcoming.find((e) => e.mine);

    const dayButton = (key: string, num: number, inMonth: boolean, maxChips: number) => {
        const list = inMonth ? (byDay[key] ?? []) : [];

        return (
            <button
                key={key}
                type="button"
                className={`cl-day${key === today ? ' today' : ''}${key === selected ? ' selected' : ''}${inMonth ? '' : ' out'}`}
                onClick={() => inMonth && setPicked(key === selected ? null : key)}
            >
                <span className="cl-num">{num}</span>
                {list.slice(0, maxChips).map((e) => (
                    <span key={`${e.id}-${e.date}`} className="cl-chip">
                        <span className="cl-chip-icon">{typeInfo(e.type).icon}</span>
                        <span className="cl-chip-text">
                            <b>{e.title}</b>
                            {e.time && <small>{prettyTime(e.time)}</small>}
                        </span>
                    </span>
                ))}
                {list.length > maxChips && <span className="cl-more">+{list.length - maxChips} more</span>}
            </button>
        );
    };

    return (
        <AppLayout title="Calendar">
            <div className="cl">
                {/* Hero */}
                <section className="cl-hero">
                    <div className="cl-hero-main">
                        <span className="cl-pill">
                            <i>{I.cal}</i>Our Calendar
                        </span>
                        <h1 className="cl-title">
                            Plan our special moments {I.heart}
                        </h1>
                        <p className="cl-sub">Keep track of appointments, dates, and all the little moments together.</p>
                    </div>
                    <HeroScene />
                </section>

                {/* Calendar */}
                <section className="cl-panel">
                    <div className="cl-bar">
                        <div className="cl-nav">
                            <Link href={`/calendar?month=${shiftMonth(month, -1)}`} preserveScroll aria-label="Previous month">
                                {I.left}
                            </Link>
                            <Link href={`/calendar?month=${shiftMonth(month, 1)}`} preserveScroll aria-label="Next month">
                                {I.right}
                            </Link>
                        </div>
                        <div className="cl-month">
                            {I.cal}
                            {title}
                        </div>
                        <div className="cl-views">
                            {VIEWS.map((v) => (
                                <button key={v.key} type="button" className={view === v.key ? 'on' : ''} onClick={() => setView(v.key)}>
                                    {v.icon}
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {view === 'agenda' ? (
                        agendaDays.length === 0 ? (
                            <p className="cl-empty">Nothing planned this month. 🌙</p>
                        ) : (
                            <div className="cl-agenda">
                                {agendaDays.map((d) => (
                                    <div key={d} className="cl-agenda-day">
                                        <strong>{prettyDate(d)}</strong>
                                        <ul className="cl-list">
                                            {byDay[d].map((e) => (
                                                <EventRow key={`${e.id}-${e.date}`} e={e} />
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className={`cl-grid${view === 'week' ? ' cl-week' : ''}`}>
                            {WEEKDAYS.map((d) => (
                                <div key={d.label} className="cl-dow">
                                    <i>{d.icon}</i>
                                    {d.label}
                                </div>
                            ))}

                            {view === 'month'
                                ? cells.map((day, i) =>
                                      day === null ? (
                                          <div key={`b${i}`} className="cl-day blank" />
                                      ) : (
                                          dayButton(`${month}-${pad(day)}`, day, true, 2)
                                      ),
                                  )
                                : weekDays.map((d) => {
                                      const key = ymd(d);

                                      return dayButton(key, d.getDate(), key.startsWith(month), 6);
                                  })}
                        </div>
                    )}
                </section>

                {/* Selected day (only after you click a day) */}
                {selected && view !== 'agenda' && (
                    <section className="cl-card">
                        <div className="cl-card-head">
                            <h2>
                                <span className="cl-pinkic">{I.cal}</span>
                                {prettyDate(selected)}
                            </h2>
                            <Link href={`/calendar/create?date=${selected}`} className="cl-link">
                                + Add something on this day
                            </Link>
                        </div>
                        {(byDay[selected] ?? []).length === 0 ? (
                            <p className="cl-muted">Nothing planned.</p>
                        ) : (
                            <ul className="cl-list">
                                {(byDay[selected] ?? []).map((e) => (
                                    <EventRow key={`${e.id}-${e.date}`} e={e} />
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                {/* Bottom row */}
                <div className="cl-bottom">
                    <section className="cl-card">
                        <div className="cl-card-head">
                            <h2>
                                <span className="cl-gold">{I.star}</span>
                                Upcoming Events
                            </h2>
                            <button type="button" className="cl-link" onClick={() => setView('agenda')}>
                                View All →
                            </button>
                        </div>
                        {upcoming.length === 0 ? (
                            <p className="cl-muted">Nothing coming up yet.</p>
                        ) : (
                            <div className="cl-up">
                                {upcoming.slice(0, 2).map((e, i) => {
                                    const days = e.days ?? 0;

                                    return (
                                        <div key={`${e.id}-${e.date}`} className={`cl-up-card${i === 0 ? ' first' : ''}`}>
                                            <span className="cl-up-icon">
                                                {e.type === 'anniversary' ? I.heartFill : typeInfo(e.type).icon}
                                            </span>
                                            <div className="cl-up-body">
                                                <small>{shortDate(e.date)}</small>
                                                <strong>{e.title}</strong>
                                                <small>
                                                    {I.clock}
                                                    {e.time ? prettyTime(e.time) : countdown(days)}
                                                </small>
                                            </div>
                                            <span className={`cl-badge${i === 0 ? ' solid' : ''}`}>
                                                {i === 0 ? 'Upcoming' : `${days} day${days === 1 ? '' : 's'} left`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="cl-card cl-qa-card">
                        <div className="cl-card-head">
                            <h2>
                                <span className="cl-pinkic">{I.bolt}</span>
                                Quick Actions
                            </h2>
                        </div>
                        <div className="cl-qa">
                            <Link href="/calendar/create">
                                {I.plus}Add Event
                            </Link>
                            {nextMine ? (
                                <Link href={`/calendar/${nextMine.id}/edit`}>
                                    {I.resched}Reschedule
                                </Link>
                            ) : (
                                <span className="off">
                                    {I.resched}Reschedule
                                </span>
                            )}
                            <Link href="/bucket">
                                {I.heartFill}Add to Bucket List
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}