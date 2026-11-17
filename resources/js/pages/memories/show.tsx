import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Heart, Lock, Pencil, Trash2, Users } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import AppLayout from '@/layouts/app-layout';
import { photoUrl, type MemoryRow } from '@/lib/memories';

const FAV_KEY = 'olu-memory-favs';

function splitCaption(caption: string | null) {
    const text = (caption ?? '').trim();
    if (!text) return { title: '', body: '' };
    const [first, ...rest] = text.split('\n');
    return { title: first, body: rest.join('\n').trim() };
}

export default function Show({ memory }: { memory: MemoryRow }) {
    const [idx, setIdx] = useState(0);
    const [confirming, setConfirming] = useState(false);
    const [fav, setFav] = useState(false);
    const [burst, setBurst] = useState(false);
    const burstTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const count = memory.photos.length;
    const photo = count > 0 ? memory.photos[Math.min(idx, count - 1)] : null;
    const { title, body } = splitCaption(memory.caption);

    useEffect(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]');
            if (Array.isArray(parsed)) setFav(parsed.includes(memory.id));
        } catch {
            /* storage unavailable: start unhearted */
        }
    }, [memory.id]);

    useEffect(() => () => clearTimeout(burstTimer.current), []);

    useEffect(() => {
        if (count < 2) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + count) % count);
            if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % count);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [count]);

    function toggleFav() {
        const adding = !fav;
        setFav(adding);
        try {
            const parsed = JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]');
            const list: number[] = Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
            const next = adding ? [...new Set([...list, memory.id])] : list.filter((n) => n !== memory.id);
            localStorage.setItem(FAV_KEY, JSON.stringify(next));
        } catch {
            /* storage unavailable: heart still works for this visit */
        }
        if (adding) {
            setBurst(true);
            clearTimeout(burstTimer.current);
            burstTimer.current = setTimeout(() => setBurst(false), 750);
        }
    }

    return (
        <AppLayout title={memory.taken_label ?? 'Memory'}>
            <div className="mv">
                <Link href="/memories" className="mv-back">
                    <ArrowLeft size={16} aria-hidden="true" /> All memories
                </Link>

                <article className="mv-board">
                    <span className="mv-glow a" aria-hidden="true" />
                    <span className="mv-glow b" aria-hidden="true" />

                    <div className="mv-photo">
                        <div className="mv-polaroid">
                            <span className="mv-tape" aria-hidden="true" />
                            <div className="mv-frame">
                                {photo ? (
                                    <img key={photo.id} src={photoUrl(photo.id)} alt={memory.caption ?? ''} />
                                ) : (
                                    <span aria-hidden="true">💭</span>
                                )}
                                {count > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className="mv-nav prev"
                                            aria-label="Previous photo"
                                            onClick={() => setIdx((i) => (i - 1 + count) % count)}
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            className="mv-nav next"
                                            aria-label="Next photo"
                                            onClick={() => setIdx((i) => (i + 1) % count)}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                        <span className="mv-count">
                                            {Math.min(idx, count - 1) + 1} / {count}
                                        </span>
                                    </>
                                )}
                            </div>
                            <span className="mv-cap">{memory.taken_label ?? 'a little memory'} ♡</span>
                        </div>

                        {count > 1 && (
                            <div className="mv-thumbs">
                                {memory.photos.map((p, i) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        className={i === idx ? 'on' : ''}
                                        aria-label={`Photo ${i + 1}`}
                                        onClick={() => setIdx(i)}
                                    >
                                        <img src={photoUrl(p.id)} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mv-paper">
                        <div className="mv-paper-top">
                            <span className="mv-date">
                                <Calendar size={15} aria-hidden="true" /> {memory.taken_label ?? 'Undated'}
                            </span>
                            <button
                                type="button"
                                className={`mv-heart${fav ? ' on' : ''}${burst ? ' pop' : ''}`}
                                aria-pressed={fav}
                                aria-label={fav ? 'Remove heart' : 'Add heart'}
                                onClick={toggleFav}
                            >
                                <Heart size={18} />
                                {burst && (
                                    <span className="mv-burst" aria-hidden="true">
                                        {Array.from({ length: 7 }, (_, k) => (
                                            <i key={k} style={{ '--a': `${k * 51}deg` } as CSSProperties}>
                                                ♥
                                            </i>
                                        ))}
                                    </span>
                                )}
                            </button>
                        </div>

                        <h1 className="mv-title">
                            {title || 'A little memory'} <em aria-hidden="true">♡</em>
                        </h1>

                        {body ? <p className="mv-text">{body}</p> : !title && <p className="mv-empty">No words for this one, just the moment.</p>}

                        <div className="mv-meta">
                            <span className="ci-chip">
                                {memory.visibility === 'shared' ? (
                                    <>
                                        <Users size={11} aria-hidden="true" /> Shared
                                    </>
                                ) : (
                                    <>
                                        <Lock size={11} aria-hidden="true" /> Private
                                    </>
                                )}
                            </span>
                            {!memory.is_owner && <span>from {memory.owner_name} ♡</span>}
                        </div>

                        {memory.moment && (
                            <Link href="/timeline" className="mv-moment">
                                🌌 Part of {memory.moment.title}
                            </Link>
                        )}

                        {memory.is_owner && (
                            <div className="mv-actions">
                                <Link href={`/memories/${memory.id}/edit`} className="home-btn ghost">
                                    <Pencil size={15} aria-hidden="true" /> Edit
                                </Link>
                                {confirming ? (
                                    <span className="mv-confirm">
                                        <span>Delete this memory and its photos?</span>
                                        <button type="button" className="home-btn yes" onClick={() => router.delete(`/memories/${memory.id}`)}>
                                            Yes, delete
                                        </button>
                                        <button type="button" className="home-btn ghost" onClick={() => setConfirming(false)}>
                                            Cancel
                                        </button>
                                    </span>
                                ) : (
                                    <button type="button" className="mv-danger" onClick={() => setConfirming(true)}>
                                        <Trash2 size={15} aria-hidden="true" /> Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </AppLayout>
    );
}