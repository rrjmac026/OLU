import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    EllipsisVertical,
    Eye,
    EyeOff,
    Heart,
    Image as ImageIcon,
    Maximize2,
    Minimize2,
    Music,
    Play,
    RotateCcw,
    Trash2,
    VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { filterCss } from '@/lib/albums';
import type { AlbumView } from '@/lib/albums';

const LIKES_KEY = 'olu-album-likes';

function useLikes() {
    const [likes, setLikes] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem(LIKES_KEY) ?? '[]');
        } catch {
            return [];
        }
    });

    const toggle = (key: string) =>
        setLikes((prev) => {
            const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
            try {
                localStorage.setItem(LIKES_KEY, JSON.stringify(next));
            } catch {
                /* storage unavailable */
            }
            return next;
        });

    return { has: (key: string) => likes.includes(key), toggle };
}

/* ---------- kebab menu (admin only) ---------- */

export function AlbumMenu({
    published,
    onPublish,
    onDelete,
    className = '',
}: {
    published: boolean;
    onPublish: () => void;
    onDelete: () => void;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const down = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const key = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', down);
        document.addEventListener('keydown', key);
        return () => {
            document.removeEventListener('mousedown', down);
            document.removeEventListener('keydown', key);
        };
    }, [open]);

    return (
        <div className={`ab-menu-wrap ${className}`} ref={ref} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ab-kebab" onClick={() => setOpen((v) => !v)} aria-label="Album options" aria-expanded={open}>
                <EllipsisVertical size={18} />
            </button>
            {open && (
                <div className="ab-menu" role="menu">
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            onPublish();
                        }}
                    >
                        {published ? <EyeOff size={16} /> : <Eye size={16} />}
                        {published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        className="danger"
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}

/* ---------- story viewer ---------- */

type Props = {
    album: AlbumView;
    autoplay: boolean;
    playSignal: number;
    canManage: boolean;
    onPublish: () => void;
    onDelete: () => void;
};

export default function AlbumViewer({ album, autoplay, playSignal, canManage, onPublish, onDelete }: Props) {
    const slides = album.slides;
    const total = slides.length;

    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(autoplay && total > 0);
    const [finished, setFinished] = useState(false);
    const [musicOn, setMusicOn] = useState(true);
    const [isFs, setIsFs] = useState(false);
    const [audioIssue, setAudioIssue] = useState<string | null>(null);

    const elapsed = useRef(0);
    const barsRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const swipe = useRef({ x: 0, done: false });
    const lastSignal = useRef(playSignal);

    const likes = useLikes();

    const slide = slides[Math.min(index, Math.max(total - 1, 0))];
    const audioUrl = slide?.song?.audio_url ?? null;
    const cover = slides[0]?.url ?? null;

    const clipStart = slide?.song?.start ?? 0;
    const clipEnd = slide?.song?.end ?? null;
    const clipKey = audioUrl ? `${audioUrl}|${clipStart}|${clipEnd ?? ''}` : '';

    /* ----- navigation ----- */

    const go = (i: number) => {
        elapsed.current = 0;
        barsRef.current?.style.setProperty('--p', '0');
        setFinished(false);
        setIndex(i);
    };

    const next = () => {
        if (index < total - 1) {
            go(index + 1);
        } else {
            barsRef.current?.style.setProperty('--p', '1');
            setPlaying(false);
            setFinished(true);
        }
    };

    const prev = () => {
        if (elapsed.current > 1500 || index === 0) go(index);
        else go(index - 1);
    };

    const toggle = () => {
        if (!total) return;
        if (playing) {
            setPlaying(false);
            return;
        }
        if (finished) go(0);
        setPlaying(true);
    };

    /* In-page "fullscreen": a fixed overlay on <body> (like Facebook stories), not the browser Fullscreen API. */
    const toggleFs = () => setIsFs((v) => !v);

    /* ----- "play" pressed on the album card ----- */

    useEffect(() => {
        if (playSignal === lastSignal.current) return;
        lastSignal.current = playSignal;
        if (!playSignal || !total) return;
        go(0);
        setPlaying(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playSignal]);

    /* ----- slide timer (drives the progress bar without re-rendering) ----- */

    const duration = slide?.duration ?? 5;

    useEffect(() => {
        if (!playing || !slide) return;

        let raf = 0;
        let last = performance.now();

        const tick = (now: number) => {
            elapsed.current += now - last;
            last = now;

            const p = Math.min(elapsed.current / (duration * 1000), 1);
            barsRef.current?.style.setProperty('--p', String(p));

            if (p >= 1) {
                next();
                return;
            }
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing, index, total, duration]);

    /* ----- music ----- */

    useEffect(() => {
        const a = audioRef.current;
        if (!a) return;

        setAudioIssue(null);

        if (!audioUrl) {
            a.pause();
            if (slide?.song) setAudioIssue('This song has no uploaded audio file');
            return;
        }

        if (!a.src.endsWith(audioUrl)) {
            a.src = audioUrl;
            a.load();
        }

        const seekToStart = () => {
            a.currentTime = clipStart;
        };
        if (a.readyState >= 1) seekToStart();
        else a.addEventListener('loadedmetadata', seekToStart, { once: true });

        fetch(audioUrl, { headers: { Range: 'bytes=0-0' }, credentials: 'same-origin' })
            .then((r) => {
                if (!r.ok && r.status !== 206) setAudioIssue(`Audio request failed (${r.status})`);
            })
            .catch(() => setAudioIssue('Audio request failed (network)'));

        return () => a.removeEventListener('loadedmetadata', seekToStart);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clipKey]);

    useEffect(() => {
        const a = audioRef.current;
        if (!a || !audioUrl || !playing || clipEnd === null) return;

        let raf = 0;
        const watch = () => {
            if (a.currentTime >= clipEnd) a.currentTime = clipStart;
            raf = requestAnimationFrame(watch);
        };

        raf = requestAnimationFrame(watch);
        return () => cancelAnimationFrame(raf);
    }, [playing, audioUrl, clipStart, clipEnd]);

    useEffect(() => {
        const a = audioRef.current;
        if (!a || !audioUrl) return;

        a.muted = !musicOn;

        if (playing) {
            // Best effort: stop any other player on the page so two songs never overlap.
            document.querySelectorAll('audio').forEach((el) => {
                if (el !== a) el.pause();
            });
            a.play().catch((err: { name?: string }) => {
                if (err?.name === 'NotAllowedError') setAudioIssue('Browser blocked sound, tap play again');
            });
        } else {
            a.pause();
        }
    }, [playing, musicOn, audioUrl]);

    useEffect(() => {
        const a = audioRef.current;
        return () => {
            a?.pause();
        };
    }, []);

    /* ----- misc ----- */

    useEffect(() => {
        const n = slides[index + 1];
        if (n) {
            const im = new window.Image();
            im.src = n.url;
        }
    }, [index, slides]);

    /* While the overlay is open: lock page scroll and let Escape close it. */
    useEffect(() => {
        if (!isFs) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFs(false);
        };
        document.addEventListener('keydown', onEsc);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', onEsc);
        };
    }, [isFs]);

    const onKey = (e: ReactKeyboardEvent) => {
        const t = e.target as HTMLElement;
        if (t.closest('input, textarea, select')) return;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            next();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prev();
        } else if (e.key === ' ' && t.tagName !== 'BUTTON') {
            e.preventDefault();
            toggle();
        } else if (e.key.toLowerCase() === 'f') {
            toggleFs();
        } else if (e.key.toLowerCase() === 'm') {
            setMusicOn((v) => !v);
        }
    };

    const eqOn = playing && !!audioUrl && musicOn;

    const player = (
        <div className={`ab-player${isFs ? ' fs' : ''}`}>
            <div className="ab-bars" ref={barsRef}>
                {slides.map((s, i) => (
                    <button
                        key={s.id}
                        type="button"
                        className={i < index ? 'done' : i === index ? 'active' : ''}
                        onClick={() => go(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    >
                        <i />
                    </button>
                ))}
            </div>

            <div className="ab-stage">
                {slide ? (
                    <>
                        <div key={slide.id} className={`ab-shot ab-t-${slide.transition}`}>
                            <img
                                src={slide.url}
                                alt={slide.caption ?? ''}
                                className="ab-kb"
                                draggable={false}
                                style={
                                    {
                                        filter: filterCss(slide.filter),
                                        '--dur': `${slide.duration + 1}s`,
                                        animationPlayState: playing ? 'running' : 'paused',
                                    } as CSSProperties
                                }
                            />
                        </div>
                        <div className="ab-vig" />

                        <button
                            type="button"
                            className="ab-hit"
                            aria-label={playing ? 'Pause' : 'Play'}
                            onPointerDown={(e) => {
                                swipe.current = { x: e.clientX, done: false };
                            }}
                            onPointerUp={(e) => {
                                const dx = e.clientX - swipe.current.x;
                                if (Math.abs(dx) > 50) {
                                    swipe.current.done = true;
                                    if (dx < 0) next();
                                    else prev();
                                }
                            }}
                            onClick={() => {
                                if (swipe.current.done) {
                                    swipe.current.done = false;
                                    return;
                                }
                                toggle();
                            }}
                        />

                        <span className={`ab-bigplay${playing ? '' : ' show'}`} aria-hidden>
                            {finished ? <RotateCcw size={34} /> : <Play size={36} fill="currentColor" />}
                        </span>

                        <span className="ab-counter">
                            {index + 1} / {total}
                        </span>

                        <button type="button" className="ab-nav prev" onClick={prev} aria-label="Previous slide">
                            <ArrowLeft size={22} />
                        </button>
                        <button type="button" className="ab-nav next" onClick={next} disabled={index >= total - 1} aria-label="Next slide">
                            <ArrowRight size={22} />
                        </button>

                        {slide.caption && (
                            <p key={`cap-${slide.id}`} className={`ab-cap ${slide.caption_position}`}>
                                <span>{slide.caption}</span>
                            </p>
                        )}

                        <div className="ab-bottom">
                            {slide.song ? (
                                <div className="ab-song">
                                    <Music size={15} />
                                    <span>
                                        {slide.song.title}
                                        {slide.song.artist ? ` – ${slide.song.artist}` : ''}
                                    </span>
                                    {audioIssue && <small className="ab-issue">⚠ {audioIssue}</small>}
                                    <span className={`ab-eqb${eqOn ? ' on' : ''}`} aria-hidden>
                                        <i />
                                        <i />
                                        <i />
                                    </span>
                                </div>
                            ) : (
                                <span />
                            )}

                            <div className="ab-bottom-actions">
                                <button type="button" className="ab-ico" onClick={toggleFs} aria-label={isFs ? 'Exit fullscreen' : 'Fullscreen'}>
                                    {isFs ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button
                                    type="button"
                                    className={`ab-ico${likes.has(`s${slide.id}`) ? ' liked' : ''}`}
                                    onClick={() => likes.toggle(`s${slide.id}`)}
                                    aria-label="Like this slide"
                                >
                                    <Heart size={19} fill={likes.has(`s${slide.id}`) ? 'currentColor' : 'none'} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="ab-stage-empty">This album has no slides yet ♡</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="ab-viewer" id="ab-viewer" tabIndex={0} onKeyDown={onKey}>
            <audio
                ref={audioRef}
                preload="auto"
                onPlaying={() => setAudioIssue(null)}
                onError={() => setAudioIssue("Can't load this song file")}
                onEnded={() => {
                    const a = audioRef.current;
                    if (!a) return;
                    a.currentTime = clipStart;
                    a.play().catch(() => {});
                }}
            />

            <header className="ab-v-head">
                <div className="ab-v-thumb">{cover ? <img src={cover} alt="" /> : <ImageIcon size={20} />}</div>
                <div className="ab-v-title">
                    <h2>{album.title}</h2>
                    <p>
                        {total} slides • {album.date_label}
                    </p>
                </div>
                <button
                    type="button"
                    className={`ab-pillbtn${musicOn ? ' on' : ''}`}
                    onClick={() => setMusicOn((v) => !v)}
                    aria-pressed={musicOn}
                >
                    {musicOn ? <Music size={16} /> : <VolumeX size={16} />}
                    {musicOn ? 'With Music' : 'Muted'}
                </button>
                {canManage && <AlbumMenu published={album.is_published} onPublish={onPublish} onDelete={onDelete} />}
            </header>

            {isFs ? createPortal(<div className="ab-fs-root">{player}</div>, document.body) : player}

            <footer className="ab-v-foot">
                <div className="ab-v-thumb round">{cover ? <img src={cover} alt="" /> : <ImageIcon size={18} />}</div>
                <div className="ab-v-foot-text">
                    <strong>{album.title}</strong>
                    {album.description && <p>{album.description}</p>}
                </div>
                <div className="ab-v-foot-side">
                    <span>
                        <CalendarDays size={15} /> {album.date_label}
                    </span>
                    <button
                        type="button"
                        className={`ab-heart${likes.has(`a${album.id}`) ? ' liked' : ''}`}
                        onClick={() => likes.toggle(`a${album.id}`)}
                        aria-label="Favorite this album"
                    >
                        <Heart size={20} fill={likes.has(`a${album.id}`) ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </footer>
        </div>
    );
}