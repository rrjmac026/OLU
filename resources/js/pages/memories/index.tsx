import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    CalendarDays,
    Camera,
    ChevronDown,
    ExternalLink,
    Heart,
    Image as ImageIcon,
    Images,
    LayoutGrid,
    List,
    Lock,
    MoreHorizontal,
    Pencil,
    Plus,
    Shuffle,
    Star,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { photoUrl, type MemoryRow } from '@/lib/memories';

type Row = MemoryRow & { has_moment: boolean; taken_input: string | null };
type Filter = 'all' | 'photos' | 'stories' | 'special';
type Sort = 'new' | 'old';
type View = 'grid' | 'list';
type Props = {
    memories: Row[];
    stats: { storage_value: number; storage_unit: string };
};

const FILTERS = [
    { key: 'all', label: 'All Memories', icon: LayoutGrid },
    { key: 'photos', label: 'Photos', icon: ImageIcon },
    { key: 'stories', label: 'Stories', icon: BookOpen },
    { key: 'special', label: 'Special Moments', icon: Star },
] as const;

const SORTS = [
    { key: 'new', label: 'Newest First' },
    { key: 'old', label: 'Oldest First' },
] as const;

const PETALS = Array.from({ length: 16 }, (_, i) => ({
    left: `${(i * 7 + 3) % 100}%`,
    delay: `${(i * 1.7) % 12}s`,
    dur: `${14 + ((i * 3) % 9)}s`,
    size: `${0.55 + ((i * 5) % 7) / 12}rem`,
}));

const FLOWERS = [
    { right: '0rem', bottom: '1.2rem', size: '2.4rem', delay: '0s' },
    { right: '2.2rem', bottom: '2.8rem', size: '1.8rem', delay: '1.2s' },
    { right: '0.2rem', bottom: '4.2rem', size: '1.5rem', delay: '2.1s' },
    { right: '1.2rem', bottom: '6rem', size: '1.3rem', delay: '0.6s' },
    { right: '13.2rem', bottom: '1rem', size: '1.8rem', delay: '1.8s' },
    { right: '14.6rem', bottom: '2.7rem', size: '1.3rem', delay: '0.3s' },
    { right: '12rem', bottom: '0.3rem', size: '1.4rem', delay: '2.6s' },
];

const SPARKS = [
    { right: '8rem', top: '1.2rem', delay: '0s' },
    { right: '15rem', top: '3.5rem', delay: '1s' },
    { right: '1.5rem', top: '2.5rem', delay: '1.8s' },
];

const FAV_KEY = 'olu-memory-favs';

function splitCaption(caption: string | null) {
    const text = (caption ?? '').trim();
    if (!text) return { title: 'Memory', sub: '' };
    const [first, ...rest] = text.split('\n');
    return { title: first, sub: rest.join(' ').trim() };
}

export default function Index({ memories, stats }: Props) {
    const [filter, setFilter] = useState<Filter>('all');
    const [sort, setSort] = useState<Sort>('new');
    const [sortOpen, setSortOpen] = useState(false);
    const [view, setView] = useState<View>('grid');
    const [openId, setOpenId] = useState<number | null>(null);
    const [photoIdx, setPhotoIdx] = useState(0);
    const [menuId, setMenuId] = useState<number | null>(null);
    const [burstId, setBurstId] = useState<number | null>(null);
    const [favs, setFavs] = useState<number[]>([]);
    const burstTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]');
            if (Array.isArray(parsed)) setFavs(parsed.filter((n) => typeof n === 'number'));
        } catch {
            /* storage unavailable: start empty */
        }
    }, []);

    useEffect(() => () => clearTimeout(burstTimer.current), []);

    useEffect(() => {
        if (menuId === null && !sortOpen) return;
        const close = () => {
            setMenuId(null);
            setSortOpen(false);
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [menuId, sortOpen]);

    useEffect(() => {
        if (openId === null) return;
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') setOpenId(null);
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener('keydown', onKey);
        };
    }, [openId]);

    const visible = useMemo(() => {
        return memories
            .filter((m) => {
                if (filter === 'photos') return m.photos.length > 0;
                if (filter === 'stories') return (m.caption?.length ?? 0) > 80;
                if (filter === 'special') return m.has_moment;
                return true;
            })
            .sort((a, b) => {
                const cmp = (a.taken_input ?? '').localeCompare(b.taken_input ?? '') || a.id - b.id;
                return sort === 'new' ? -cmp : cmp;
            });
    }, [memories, filter, sort]);

    const current = openId === null ? null : (memories.find((m) => m.id === openId) ?? null);

    function openMemory(id: number) {
        setOpenId(id);
        setPhotoIdx(0);
        setMenuId(null);
    }

    function toggleFav(e: MouseEvent, id: number) {
        e.stopPropagation();
        const adding = !favs.includes(id);
        const next = adding ? [...favs, id] : favs.filter((n) => n !== id);
        setFavs(next);
        try {
            localStorage.setItem(FAV_KEY, JSON.stringify(next));
        } catch {
            /* storage unavailable: heart still works for this visit */
        }
        if (adding) {
            setBurstId(id);
            clearTimeout(burstTimer.current);
            burstTimer.current = setTimeout(() => setBurstId(null), 750);
        }
    }

    function onCardKey(e: KeyboardEvent<HTMLDivElement>, id: number) {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            openMemory(id);
        }
    }

    const photoCount = current?.photos.length ?? 0;
    const shownPhoto = current && photoCount > 0 ? current.photos[Math.min(photoIdx, photoCount - 1)] : null;
    const currentText = current ? splitCaption(current.caption) : null;
    const sortLabel = SORTS.find((s) => s.key === sort)?.label;

    return (
        <AppLayout title="Memories">
            <div className="mg">
                <div className="mg-petals" aria-hidden="true">
                    {PETALS.map((p, i) => (
                        <span
                            key={i}
                            className="mg-petal"
                            style={{ left: p.left, '--delay': p.delay, '--dur': p.dur, '--size': p.size } as CSSProperties}
                        />
                    ))}
                </div>

                <section className="mg-hero">
                    <div className="mg-hero-text">
                        <span className="home-pill">
                            <Camera size={16} aria-hidden="true" /> Our Memories ♡
                        </span>
                        <h1 className="mg-title">
                            <span className="mg-line">
                                A collection of <b>moments</b>
                            </span>
                            <span className="mg-line l2">
                                that mean the world to me. <em aria-hidden="true">♡</em>
                            </span>
                        </h1>
                        <p>Because every moment with you is special.</p>
                    </div>

                    <span className="mg-star" aria-hidden="true">
                        ✦
                    </span>

                    <div className="mg-art" aria-hidden="true">
                        <span className="mg-cloud" style={{ right: '-2rem', width: '14rem', height: '6rem' }} />
                        <span className="mg-cloud" style={{ right: '10rem', width: '10rem', height: '4.5rem' }} />
                        <div className="mg-arch">
                            <Heart size={46} />
                        </div>
                        <span className="mg-step s2" />
                        <span className="mg-step s1" />
                        {FLOWERS.map((f, i) => (
                            <span key={i} className="mg-flower" style={{ right: f.right, bottom: f.bottom, fontSize: f.size, animationDelay: f.delay }}>
                                🌸
                            </span>
                        ))}
                        {SPARKS.map((s, i) => (
                            <span key={i} className="mg-spark" style={{ right: s.right, top: s.top, animationDelay: s.delay }}>
                                ✦
                            </span>
                        ))}
                    </div>
                </section>

                <div className="mg-bar">
                    <div className="mg-filters" role="tablist" aria-label="Filter memories">
                        {FILTERS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={filter === key}
                                className={`mg-filter${filter === key ? ' on' : ''}`}
                                onClick={() => setFilter(key)}
                            >
                                <Icon size={16} aria-hidden="true" /> {label}
                            </button>
                        ))}
                    </div>

                    <span className="mg-butterfly" aria-hidden="true">
                        🦋
                    </span>

                    <div className="mg-bar-end">
                        <div className="mg-sort">
                            <button
                                type="button"
                                className={`mg-sort-btn${sortOpen ? ' open' : ''}`}
                                aria-haspopup="listbox"
                                aria-expanded={sortOpen}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuId(null);
                                    setSortOpen((o) => !o);
                                }}
                            >
                                <Shuffle size={16} aria-hidden="true" /> {sortLabel} <ChevronDown size={16} aria-hidden="true" />
                            </button>
                            {sortOpen && (
                                <div className="mg-sort-menu" role="listbox" aria-label="Sort memories">
                                    {SORTS.map((s) => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            role="option"
                                            aria-selected={sort === s.key}
                                            className={sort === s.key ? 'on' : ''}
                                            onClick={() => setSort(s.key)}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mg-view">
                            <button type="button" className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Grid view">
                                <LayoutGrid size={16} />
                            </button>
                            <button type="button" className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="List view">
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`mg-grid${view === 'list' ? ' list' : ''}`} key={`${filter}-${sort}-${view}`}>
                    <Link href="/memories/create" className="mg-add" style={{ '--i': 0 } as CSSProperties}>
                        <span className="mg-add-bow" aria-hidden="true">
                            🎀
                        </span>
                        <span className="mg-add-flower" aria-hidden="true">
                            🌸
                        </span>
                        <span className="mg-add-spark" style={{ right: '1.4rem', top: '1.2rem' }} aria-hidden="true">
                            ✦
                        </span>
                        <span className="mg-add-spark" style={{ right: '2.2rem', bottom: '2.6rem', animationDelay: '1s' }} aria-hidden="true">
                            ✦
                        </span>
                        <span className="mg-add-plus">
                            <Plus size={26} aria-hidden="true" />
                        </span>
                        <strong>Add a Memory</strong>
                        <small>Upload a photo or create a memory together ♡</small>
                    </Link>

                    {visible.map((m, i) => {
                        const { title, sub } = splitCaption(m.caption);
                        const fav = favs.includes(m.id);
                        const subtitle = sub || (m.is_owner ? (m.visibility === 'shared' ? 'Shared memory' : 'Private memory') : `from ${m.owner_name}`);

                        return (
                            <div
                                key={m.id}
                                role="button"
                                tabIndex={0}
                                className={`mg-card${menuId === m.id ? ' menu-open' : ''}`}
                                style={{ '--i': i + 1 } as CSSProperties}
                                onClick={() => openMemory(m.id)}
                                onKeyDown={(e) => onCardKey(e, m.id)}
                            >
                                <div className="mg-card-bg">
                                    {m.photos.length > 0 ? (
                                        <img src={photoUrl(m.photos[0].id)} alt="" loading="lazy" />
                                    ) : (
                                        <div className="mg-card-none" aria-hidden="true">
                                            💭
                                        </div>
                                    )}
                                </div>

                                <div className="mg-top">
                                    <span className="mg-chip">
                                        <Calendar size={13} aria-hidden="true" /> {m.taken_label ?? 'Memory'}
                                    </span>
                                    <button
                                        type="button"
                                        className={`mg-heart${fav ? ' on' : ''}${burstId === m.id ? ' pop' : ''}`}
                                        aria-pressed={fav}
                                        aria-label={fav ? 'Remove heart' : 'Add heart'}
                                        onClick={(e) => toggleFav(e, m.id)}
                                    >
                                        <Heart size={21} />
                                        {burstId === m.id && (
                                            <span className="mg-burst" aria-hidden="true">
                                                {Array.from({ length: 7 }, (_, k) => (
                                                    <i key={k} style={{ '--a': `${k * 51}deg` } as CSSProperties}>
                                                        ♥
                                                    </i>
                                                ))}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="mg-card-body">
                                    <div className="mg-card-text">
                                        <strong>{title} ♡</strong>
                                        <small>{subtitle}</small>
                                    </div>
                                    <button
                                        type="button"
                                        className="mg-more"
                                        aria-label="More"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSortOpen(false);
                                            setMenuId(menuId === m.id ? null : m.id);
                                        }}
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                {menuId === m.id && (
                                    <div className="mg-menu" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/memories/${m.id}`}>
                                            <ExternalLink size={14} aria-hidden="true" /> Open full page
                                        </Link>
                                        {m.is_owner && (
                                            <Link href={`/memories/${m.id}/edit`}>
                                                <Pencil size={14} aria-hidden="true" /> Edit
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {visible.length === 0 && (
                        <p className="mg-empty">{memories.length === 0 ? 'No memories yet. Add your first one ♡' : 'Nothing matches here yet.'}</p>
                    )}

                    <section className="mg-panel stats">
                        <h2>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <rect x="4" y="12" width="4" height="8" rx="1" />
                                <rect x="10" y="4" width="4" height="16" rx="1" />
                                <rect x="16" y="9" width="4" height="11" rx="1" />
                            </svg>
                            Memory Stats <span className="spark">✦</span>
                        </h2>
                        <div className="mg-stat">
                            <strong>{memories.length}</strong>
                            <span>Total Memories</span>
                        </div>
                        <div className="mg-stat">
                            <strong>
                                {stats.storage_value}
                                <small>{stats.storage_unit}</small>
                            </strong>
                            <span>Storage Used</span>
                        </div>
                        <span className="mg-cat-bubble" aria-hidden="true">
                            ♥
                        </span>
                        <span className="mg-pillow" aria-hidden="true" />
                        <span className="mg-cat" aria-hidden="true">
                            🐱
                        </span>
                    </section>

                    <section className="mg-panel quick">
                        <h2>
                            <Zap size={18} aria-hidden="true" /> Quick Actions
                        </h2>
                        <nav className="mg-quick-list">
                            <Link href="/timeline">
                                <CalendarDays size={18} aria-hidden="true" /> View Timeline <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                            <Link href="/journal">
                                <BookOpen size={18} aria-hidden="true" /> Open Journal <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                            <Link href="/memories/create">
                                <Plus size={18} aria-hidden="true" /> Add a Memory <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                            <button type="button" onClick={() => setFilter('photos')}>
                                <Images size={18} aria-hidden="true" /> View Gallery <ArrowRight size={16} aria-hidden="true" />
                            </button>
                        </nav>
                    </section>
                </div>

                <p className="mg-foot">
                    <Heart size={16} aria-hidden="true" /> You are my favorite memory. ♡
                </p>

                {current && currentText && (
                    <div className="mg-modal" onClick={() => setOpenId(null)}>
                        <div className="mg-scrap" role="dialog" aria-modal="true" aria-label="Memory" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="mg-close" aria-label="Close" onClick={() => setOpenId(null)}>
                                <X size={18} />
                            </button>

                            <div className="mg-photo">
                                <div className="mg-polaroid">
                                    <span className="mg-tape" aria-hidden="true" />
                                    <div className="mg-polaroid-img">
                                        {shownPhoto ? (
                                            <img key={shownPhoto.id} src={photoUrl(shownPhoto.id)} alt="" />
                                        ) : (
                                            <span aria-hidden="true">💭</span>
                                        )}
                                    </div>
                                    <span className="mg-polaroid-cap">{current.taken_label ?? 'a little memory'} ♡</span>
                                </div>
                                {photoCount > 1 && (
                                    <div className="mg-thumbs">
                                        {current.photos.map((p, i) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                className={i === photoIdx ? 'on' : ''}
                                                aria-label={`Photo ${i + 1}`}
                                                onClick={() => setPhotoIdx(i)}
                                            >
                                                <img src={photoUrl(p.id)} alt="" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mg-paper">
                                <span className="mg-paper-date">
                                    <Calendar size={14} aria-hidden="true" /> {current.taken_label ?? 'Undated'}
                                </span>
                                <h3>{currentText.title} ♡</h3>
                                {currentText.sub && <p>{currentText.sub}</p>}
                                <div className="mg-paper-meta">
                                    <span className="ci-chip">
                                        {current.visibility === 'shared' ? (
                                            <>
                                                <Users size={11} aria-hidden="true" /> Shared
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={11} aria-hidden="true" /> Private
                                            </>
                                        )}
                                    </span>
                                    {!current.is_owner && <small>from {current.owner_name} ♡</small>}
                                </div>
                                <div className="mg-paper-actions">
                                    <Link href={`/memories/${current.id}`} className="home-btn">
                                        <ExternalLink size={14} aria-hidden="true" /> Open full page
                                    </Link>
                                    {current.is_owner && (
                                        <Link href={`/memories/${current.id}/edit`} className="home-btn ghost">
                                            <Pencil size={14} aria-hidden="true" /> Edit
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}