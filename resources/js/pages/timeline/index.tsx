import { Link } from '@inertiajs/react';
import { Calendar, Crown, Heart, Image as ImageIcon, Lock, Pencil, Plus, Sparkles, Star, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import AppLayout from '../../layouts/app-layout';
import { prettyDate } from '../../lib/calendar';
import { photoUrl } from '../../lib/memories';
import type { Moment } from '../../lib/timeline';

type Item = Moment & { photo_id?: number | null; memories_count?: number };
type Filter = 'all' | 'milestones' | 'memories' | 'special';
type Kind = 'milestone' | 'memory' | 'special';

const FILTERS = [
    { key: 'all', label: 'All', icon: Sparkles },
    { key: 'milestones', label: 'Milestones', icon: Star },
    { key: 'memories', label: 'Memories', icon: ImageIcon },
    { key: 'special', label: 'Special Moments', icon: Crown },
] as const;

const KIND_ICON = { milestone: Sparkles, memory: ImageIcon, special: Crown } as const;

const SPARKS = [
    { right: '30rem', top: '1.4rem', delay: '0s' },
    { right: '21rem', top: '3.2rem', delay: '1s' },
    { right: '36rem', top: '9rem', delay: '1.8s' },
];

const hasPhoto = (m: Item) => Boolean(m.photo_id) || (m.memories_count ?? 0) > 0;
const isSpecial = (m: Item) => m.visibility === 'shared' || !m.mine;

function kindOf(m: Item): Kind {
    if (hasPhoto(m)) return 'memory';
    if (isSpecial(m)) return 'special';
    return 'milestone';
}

function matches(m: Item, f: Filter): boolean {
    if (f === 'memories') return hasPhoto(m);
    if (f === 'special') return isSpecial(m);
    if (f === 'milestones') return !hasPhoto(m) && !isSpecial(m);
    return true;
}

export default function TimelineIndex({ moments }: { moments: Item[] }) {
    const [filter, setFilter] = useState<Filter>('all');
    const listRef = useRef<HTMLOListElement>(null);

    const shown = useMemo(() => moments.filter((m) => matches(m, filter)), [moments, filter]);
    const memoriesTotal = useMemo(() => moments.reduce((sum, m) => sum + (m.memories_count ?? 0), 0), [moments]);
    const since = useMemo(() => moments.map((m) => m.date).sort()[0] ?? null, [moments]);

    useEffect(() => {
        const items = listRef.current?.querySelectorAll<HTMLElement>('.tj-item');
        if (!items || items.length === 0) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('in'));
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
        );
        items.forEach((el) => io.observe(el));

        return () => io.disconnect();
    }, [shown]);

    return (
        <AppLayout title="Our timeline">
            <div className="tj">
                <section className="tj-hero">
                    <div className="tj-hero-text">
                        <span className="home-pill">
                            <Calendar size={16} aria-hidden="true" /> Our Timeline ♡
                        </span>
                        <h1 className="tj-title">
                            Our Journey <span>Together</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p>A collection of our most special moments, from the beginning until forever.</p>
                    </div>

                    <div className="tj-art" aria-hidden="true">
                        <span className="tj-cloud" style={{ right: '-3rem', width: '16rem', height: '6.5rem' }} />
                        <span className="tj-cloud" style={{ right: '12rem', width: '11rem', height: '5rem' }} />
                        <div className="tj-orb">
                            <div className="tj-orb-core">
                                <Heart size={34} />
                            </div>
                        </div>
                        {SPARKS.map((s, i) => (
                            <span key={i} className="tj-spark" style={{ right: s.right, top: s.top, animationDelay: s.delay }}>
                                ✦
                            </span>
                        ))}
                    </div>

                    <div className="tj-stats">
                        <div className="tj-stat">
                            <Heart size={20} aria-hidden="true" />
                            <span>Total Events</span>
                            <strong>{moments.length}</strong>
                        </div>
                        <div className="tj-stat">
                            <ImageIcon size={20} aria-hidden="true" />
                            <span>Memories</span>
                            <strong>{memoriesTotal}</strong>
                        </div>
                        <div className="tj-stat">
                            <Calendar size={20} aria-hidden="true" />
                            <span>Together Since</span>
                            <strong>{since ? prettyDate(since) : '—'}</strong>
                        </div>
                    </div>
                </section>

                <div className="tj-bar">
                    <div className="tj-filters" role="tablist" aria-label="Filter timeline">
                        {FILTERS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={filter === key}
                                className={`tj-filter${filter === key ? ' on' : ''}`}
                                onClick={() => setFilter(key)}
                            >
                                <Icon size={16} aria-hidden="true" /> {label}
                            </button>
                        ))}
                    </div>
                    <Link href="/timeline/create" className="home-btn tj-add">
                        Add Event <Plus size={18} aria-hidden="true" />
                    </Link>
                </div>

                {moments.length === 0 && (
                    <div className="tj-empty">
                        <span aria-hidden="true">🌌</span>
                        <strong>No moments yet</strong>
                        <small>Add the first one, like the day it all started.</small>
                        <Link href="/timeline/create" className="home-btn">
                            Add the first moment
                        </Link>
                    </div>
                )}

                {moments.length > 0 && shown.length === 0 && (
                    <div className="tj-empty">
                        <span aria-hidden="true">🌸</span>
                        <strong>Nothing here yet</strong>
                        <small>No moments match this filter.</small>
                    </div>
                )}

                {shown.length > 0 && (
                    <ol className="tj-list" ref={listRef} key={filter}>
                        {shown.map((m, i) => {
                            const kind = kindOf(m);
                            const Icon = KIND_ICON[kind];

                            return (
                                <li key={m.id} className={`tj-item ${i % 2 === 0 ? 'left' : 'right'}`} style={{ '--d': `${(i % 4) * 70}ms` } as CSSProperties}>
                                    <article className="tj-card">
                                        <div className="tj-text">
                                            <div className="tj-meta">
                                                <span className={`tj-kind ${kind}`}>
                                                    <Icon size={16} aria-hidden="true" />
                                                </span>
                                                <span className="tj-date">{prettyDate(m.date)}</span>
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
                                            <h3 className="tj-name">
                                                {m.title} <em aria-hidden="true">♡</em>
                                            </h3>
                                            {m.story && <p className="tj-story">{m.story}</p>}
                                            {m.mine && (
                                                <Link href={`/timeline/${m.id}/edit`} className="tj-edit">
                                                    <Pencil size={13} aria-hidden="true" /> Edit
                                                </Link>
                                            )}
                                        </div>
                                        <div className="tj-tile">
                                            {m.photo_id ? <img src={photoUrl(m.photo_id)} alt="" loading="lazy" /> : <Icon size={34} aria-hidden="true" />}
                                        </div>
                                    </article>
                                    <span className="tj-node" aria-hidden="true">
                                        <Heart size={14} />
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                )}

                {moments.length > 0 && (
                    <div className="tj-end">
                        <span>
                            <Heart size={14} aria-hidden="true" /> And many more memories to come... ♡ <Heart size={14} aria-hidden="true" />
                        </span>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}