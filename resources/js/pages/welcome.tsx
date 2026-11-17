import '../../css/welcome.css';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';
import { LiveBackdrop } from '@/features/backgrounds/components/live-backdrop';

type Props = { background: { version: number } | null };

type Heart = {
    id: number;
    x: number;
    y: number;
    dx: number;
    rot: number;
    size: number;
    glyph: string;
};

/* set this to your date, e.g. '2024-02-14', to show the day counter */
const TOGETHER_SINCE = '';

const LINES = [
    'A cozy little corner, just for two.',
    'Every day with you is my favorite.',
    'Our memories, safe and sparkly.',
    'Home is wherever you are ♡',
    'Just us, against the whole universe.',
];

const GLYPHS = ['💗', '💖', '💕', '✨', '🌸', '💫'];

let heartId = 0;

export default function Welcome({ background }: Props) {
    const style = background ? { backgroundImage: `url(/backdrop?v=${background.version})` } : undefined;

    const cardRef = useRef<HTMLElement>(null);
    const [hearts, setHearts] = useState<Heart[]>([]);
    const [taps, setTaps] = useState(0);
    const [line, setLine] = useState(0);
    const [days, setDays] = useState<number | null>(null);

    /* deterministic stars so server and client markup match */
    const stars = useMemo(
        () =>
            Array.from({ length: 30 }, (_, i) => ({
                left: (i * 37 + 11) % 100,
                top: (i * 53 + 7) % 100,
                size: 2 + (i % 3),
                delay: (i % 7) * 0.6,
                duration: 2.6 + (i % 5) * 0.7,
            })),
        [],
    );

    /* rotating sweet lines */
    useEffect(() => {
        const t = window.setInterval(() => setLine((l) => (l + 1) % LINES.length), 3800);
        return () => window.clearInterval(t);
    }, []);

    /* days together */
    useEffect(() => {
        if (!TOGETHER_SINCE) return;
        const start = new Date(TOGETHER_SINCE).getTime();
        if (Number.isNaN(start)) return;
        setDays(Math.max(0, Math.floor((Date.now() - start) / 86400000)));
    }, []);

    const burst = useCallback((x: number, y: number, count: number) => {
        const batch: Heart[] = Array.from({ length: count }, () => ({
            id: ++heartId,
            x,
            y,
            dx: Math.round((Math.random() - 0.5) * 180),
            rot: Math.round((Math.random() - 0.5) * 60),
            size: 16 + Math.round(Math.random() * 16),
            glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        }));
        setHearts((prev) => [...prev, ...batch].slice(-60));
        const ids = new Set(batch.map((h) => h.id));
        window.setTimeout(() => setHearts((prev) => prev.filter((h) => !ids.has(h.id))), 1700);
    }, []);

    const onMove = (e: ReactPointerEvent<HTMLElement>) => {
        const el = cardRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', `${((0.5 - py) * 10).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${((px - 0.5) * 12).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    };

    const onLeave = () => {
        const el = cardRef.current;
        if (!el) return;
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--gx', '50%');
        el.style.setProperty('--gy', '30%');
    };

    const onCardClick = (e: ReactMouseEvent<HTMLElement>) => {
        if ((e.target as HTMLElement).closest('a, button')) return;
        const el = cardRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        burst(e.clientX - r.left, e.clientY - r.top, 3);
    };

    const onHeart = (e: ReactMouseEvent<HTMLButtonElement>) => {
        const el = cardRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const b = e.currentTarget.getBoundingClientRect();
        burst(b.left - r.left + b.width / 2, b.top - r.top + b.height / 2, 12);
        setTaps((t) => t + 1);
    };

    return (
        <>
            <Head title="Our Little Universe" />
            <div className="landing" style={style}>
                <div className="landing-overlay" />

                <div className="wl-stars" aria-hidden="true">
                    {stars.map((s, i) => (
                        <span
                            key={i}
                            style={
                                {
                                    left: `${s.left}%`,
                                    top: `${s.top}%`,
                                    width: s.size,
                                    height: s.size,
                                    animationDelay: `${s.delay}s`,
                                    animationDuration: `${s.duration}s`,
                                } as CSSProperties
                            }
                        />
                    ))}
                </div>

                <div className="wl-stage">
                    <main className="wl-card" ref={cardRef} onPointerMove={onMove} onPointerLeave={onLeave} onClick={onCardClick}>
                        <div className="wl-glare" aria-hidden="true" />

                        <div className="wl-hearts" aria-hidden="true">
                            {hearts.map((h) => (
                                <span
                                    key={h.id}
                                    className="wl-float"
                                    style={
                                        {
                                            left: h.x,
                                            top: h.y,
                                            fontSize: h.size,
                                            '--dx': `${h.dx}px`,
                                            '--rot': `${h.rot}deg`,
                                        } as CSSProperties
                                    }
                                >
                                    {h.glyph}
                                </span>
                            ))}
                        </div>

                        <div className="wl-orbit">
                            <span className="wl-ring" aria-hidden="true" />
                            <span className="wl-star wl-star-a" aria-hidden="true" />
                            <span className="wl-star wl-star-b" aria-hidden="true" />
                            <button type="button" className="wl-heart" onClick={onHeart} aria-label="Send some love">
                                <span>♥</span>
                            </button>
                        </div>

                        <h1 className="wl-title">
                            Our Little <span>Universe</span> ✨
                        </h1>

                        <p key={line} className="wl-line">
                            {LINES[line]}
                        </p>

                        <div className="wl-meta">
                            {days !== null && (
                                <span className="wl-chip">
                                    💞 together for <b>{days.toLocaleString()}</b> {days === 1 ? 'day' : 'days'}
                                </span>
                            )}
                            <span className="wl-chip">{taps === 0 ? 'tap the heart ♡' : `${taps} love ${taps === 1 ? 'tap' : 'taps'} sent 💌`}</span>
                        </div>

                        <Link href="/login" className="wl-login">
                            <span>Enter our universe</span>
                            <i aria-hidden="true">→</i>
                        </Link>
                    </main>
                </div>
            </div>
            <LiveBackdrop />
        </>
    );
}