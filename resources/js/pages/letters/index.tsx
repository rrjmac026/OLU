import '../../../css/letters.css';
import { Link, router, usePage, usePoll } from '@inertiajs/react';

import {
    ArrowUpDown,
    Calendar,
    ChevronDown,
    Gift,
    Heart,
    LayoutGrid,
    List,
    Lock,
    Mail,
    MoreHorizontal,
    PenLine,
    Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import LetterScene, { sceneFor } from '@/components/letter-scene';
import { occasionInfo, type LetterRow } from '@/lib/letters';
import type { SharedProps } from '@/types/olu';

/* excerpt + created_at are optional: the page falls back gracefully if the backend doesn't send them */
type Row = LetterRow & { excerpt?: string | null; created_at?: string | null };

type Cat = 'love' | 'sweet' | 'surprise';
type TabKey = 'all' | Cat;

const TABS: { key: TabKey; label: string; icon: typeof Heart }[] = [
    { key: 'all', label: 'All Letters', icon: LayoutGrid },
    { key: 'love', label: 'Love Letters', icon: Heart },
    { key: 'sweet', label: 'Sweet Notes', icon: Sparkles },
    { key: 'surprise', label: 'Surprise Letters', icon: Gift },
];

const CHIP: Record<Cat, string> = {
    love: 'Love Letter',
    sweet: 'Sweet Note',
    surprise: 'Surprise Letter',
};

const HEART = 'M0 10 C-22 -6 -16 -26 0 -14 C16 -26 22 -6 0 10Z';
const SPARK = 'M0 -11 Q0 0 11 0 Q0 0 0 11 Q0 0 -11 0 Q0 0 0 -11Z';

function categoryOf(l: Row): Cat {
    const kind = l.kind as string;
    if (kind === 'open_when') return 'surprise';
    if (kind === 'sweet') return 'sweet';
    return 'love';
}

function sortKey(l: Row): number {
    const t = l.created_at ? Date.parse(l.created_at) : NaN;
    return Number.isNaN(t) ? Number(l.id) : t;
}

function formatDate(iso?: string | null): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

/* ---------- illustrations ---------- */
function Flower({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy={-r * 0.9} rx={r * 0.55} ry={r * 0.8} transform={`rotate(${a})`} fill="#ff9fcf" opacity=".95" />
            ))}
            <circle r={r * 0.38} fill="#ffe08a" />
        </g>
    );
}

function Spark({ x, y, s = 1, cls = '' }: { x: number; y: number; s?: number; cls?: string }) {
    return <path d={SPARK} transform={`translate(${x} ${y}) scale(${s})`} fill="#ffd6ec" className={`lt-twinkle ${cls}`} />;
}

function HeroArt() {
    return (
        <svg className="lt-hero-art" viewBox="0 0 640 230" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
            <defs>
                <linearGradient id="lt-env-h" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffe3f4" stopOpacity=".85" />
                    <stop offset="1" stopColor="#d79be8" stopOpacity=".6" />
                </linearGradient>
                <linearGradient id="lt-cloud-h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f08fcf" stopOpacity=".95" />
                    <stop offset="1" stopColor="#8a4f9e" stopOpacity=".95" />
                </linearGradient>
                <filter id="lt-glow-h" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="6" />
                </filter>
            </defs>

            <ellipse cx="250" cy="250" rx="200" ry="62" fill="url(#lt-cloud-h)" opacity=".65" />
            <ellipse cx="520" cy="244" rx="180" ry="56" fill="url(#lt-cloud-h)" opacity=".85" />
            <ellipse cx="650" cy="205" rx="100" ry="52" fill="url(#lt-cloud-h)" />

            <g transform="translate(350 26) rotate(-9 110 80)">
                <rect x="0" y="20" width="220" height="140" rx="14" fill="url(#lt-env-h)" stroke="#fff" strokeOpacity=".55" />
                <path d="M6 28 L110 100 L214 28" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
                <path d="M6 154 L90 88 M214 154 L130 88" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
                <g transform="translate(110 92)">
                    <path d={HEART} fill="#ff6fb5" filter="url(#lt-glow-h)" transform="scale(2.3)" />
                    <path d={HEART} fill="#ff8cc6" stroke="#fff" strokeOpacity=".8" transform="scale(1.7)" />
                </g>
            </g>

            <Flower x={336} y={176} r={17} />
            <Flower x={304} y={140} r={12} />
            <Flower x={580} y={150} r={17} />
            <Flower x={612} y={108} r={13} />
            <Flower x={540} y={196} r={13} />
            <Flower x={606} y={52} r={11} />
            <Flower x={640} y={170} r={14} />

            <Spark x={240} y={62} s={1.3} />
            <Spark x={420} y={18} s={.9} cls="d2" />
            <Spark x={170} y={150} s={.8} cls="d3" />
            <Spark x={560} y={24} s={.7} cls="d2" />
        </svg>
    );
}

function WriteArt() {
    return (
        <svg className="lt-write-art" viewBox="0 0 240 150" aria-hidden="true">
            <defs>
                <linearGradient id="lt-env-w" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffe3f4" stopOpacity=".95" />
                    <stop offset="1" stopColor="#c98fe0" stopOpacity=".75" />
                </linearGradient>
                <filter id="lt-glow-w" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="5" />
                </filter>
            </defs>
            <ellipse cx="120" cy="150" rx="110" ry="26" fill="#8a4f9e" opacity=".55" />
            <ellipse cx="120" cy="82" rx="78" ry="26" fill="none" stroke="#ff9ccd" strokeOpacity=".4" transform="rotate(-12 120 82)" />
            <g transform="translate(62 54) rotate(-6 58 40)">
                <rect x="0" y="12" width="116" height="76" rx="9" fill="url(#lt-env-w)" stroke="#fff" strokeOpacity=".55" />
                <path d="M4 18 L58 58 L112 18" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" />
            </g>
            <g transform="translate(120 52)">
                <path d={HEART} fill="#ff6fb5" filter="url(#lt-glow-w)" transform="scale(1.7)" />
                <path d={HEART} fill="#ff8cc6" stroke="#fff" strokeOpacity=".8" transform="scale(1.25)" />
            </g>
            <Flower x={44} y={118} r={10} />
            <Flower x={196} y={112} r={9} />
            <Spark x={36} y={52} s={.8} />
            <Spark x={206} y={36} s={.9} cls="d2" />
            <Spark x={176} y={14} s={.6} cls="d3" />
            <Spark x={96} y={14} s={.6} cls="d2" />
        </svg>
    );
}

/* ---------- letter row ---------- */
function LetterItem({ l }: { l: Row }) {
    const occ = occasionInfo(l.occasion);
    const cat = categoryOf(l);
    const lockedForMe = l.locked && !l.is_sender;

    const state = l.is_sender
        ? l.unlock_label
            ? `Unlocks ${l.unlock_label}`
            : 'Ready to open'
        : l.locked
          ? `Opens ${l.unlock_label}`
          : l.sealed
            ? 'Sealed - tap to open'
            : 'Opened';

    const preview = l.excerpt || (occ ? occ.label : state);
    const date = formatDate(l.created_at) ?? state;
    const href = `/letters/${l.id}`;

    return (
        <article className={`lt-row ${lockedForMe ? 'is-locked' : ''}`}>
            <Link href={href} className="lt-thumb scene" aria-label={l.title} tabIndex={-1}>
                <LetterScene scene={sceneFor(l)} />
            </Link>

            <div className="lt-row-body">
                <h3 className="lt-row-title">
                    <Link href={href}>{l.title}</Link>
                    <Heart size={17} />
                </h3>
                <p className="lt-row-preview">{preview}</p>
                <div className="lt-row-meta">
                    <span className="lt-date">
                        <Calendar size={14} />
                        {date}
                    </span>
                    <span className="lt-chip">{CHIP[cat]}</span>
                </div>
            </div>

            <div className="lt-row-actions">
                <Link href={href} className={`lt-read ${lockedForMe ? 'locked' : ''}`}>
                    {lockedForMe ? <Lock size={15} /> : <Heart size={15} />}
                    {lockedForMe ? 'Locked' : 'Read'}
                </Link>
                <Link href={href} className="lt-more" aria-label="Open letter">
                    <MoreHorizontal size={18} />
                </Link>
            </div>
        </article>
    );
}

/* ---------- page ---------- */
export default function Index({ letters }: { letters: Row[] }) {
    const { auth } = usePage<SharedProps>().props;
    const isAdmin = auth.user.role === 'admin';

    usePoll(5000, { only: ['letters'] });

    // ...and refresh instantly when you come back to the tab
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible') router.reload({ only: ['letters'] });
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, []);

    const [tab, setTab] = useState<TabKey>('all');
    const [newest, setNewest] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const shown = useMemo(() => {
        const rows = tab === 'all' ? letters : letters.filter((l) => categoryOf(l) === tab);
        return [...rows].sort((a, b) => (newest ? sortKey(b) - sortKey(a) : sortKey(a) - sortKey(b)));
    }, [letters, tab, newest]);

    return (
        <AppLayout title="Letters">
            <div className="lt">
                {/* Hero */}
                <section className="lt-hero">
                    <div className="lt-hero-text">
                        <span className="lt-pill">
                            <Mail size={16} />
                            Letters
                            <Heart size={12} />
                        </span>
                        <h1 className="lt-title">
                            Letters
                            <Heart size={34} />
                        </h1>
                        <p className="lt-sub">
                            A collection of love letters, thoughts, and little messages for each other. <Heart size={16} />
                        </p>
                    </div>
                    <HeroArt />
                </section>

                {/* Tabs + tools */}
                <div className="lt-bar">
                    <div className="lt-tabs">
                        {TABS.map((t) => (
                            <button key={t.key} type="button" className={`lt-tab ${tab === t.key ? 'on' : ''}`} onClick={() => setTab(t.key)}>
                                <t.icon size={18} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="lt-tools">
                        <label className="lt-sort">
                            <ArrowUpDown size={16} />
                            <select value={newest ? 'new' : 'old'} onChange={(e) => setNewest(e.target.value === 'new')} aria-label="Sort letters">
                                <option value="new">Newest First</option>
                                <option value="old">Oldest First</option>
                            </select>
                            <ChevronDown size={16} className="lt-chev" />
                        </label>

                        <div className="lt-toggle">
                            <button type="button" className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Card view">
                                <LayoutGrid size={18} />
                            </button>
                            <button type="button" className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="Compact view">
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className={`lt-body ${isAdmin ? '' : 'solo'}`}>
                    {isAdmin && (
                        <aside className="lt-write">
                            <WriteArt />
                            <h3>Write a new letter!</h3>
                            <p>Pour your heart out and create a new memory together.</p>
                            <Link href="/letters/create" className="lt-write-btn">
                                <PenLine size={18} />
                                Write a Letter
                            </Link>
                        </aside>
                    )}

                    <div className={`lt-list ${view === 'list' ? 'compact' : ''}`}>
                        {shown.length === 0 ? (
                            <div className="lt-empty">
                                <Mail size={34} />
                                <strong>No letters here yet</strong>
                                <small>Letters you write or receive will show up here.</small>
                            </div>
                        ) : (
                            shown.map((l) => <LetterItem key={l.id} l={l} />)
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="lt-foot">
                    <span>
                        <Sparkles size={16} />
                        Every letter is a piece of our story
                        <Heart size={15} />
                        <Sparkles size={16} />
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}
