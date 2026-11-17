import { Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import SongTrimmer from '@/components/song-trimmer';
import AppLayout from '@/layouts/app-layout';
import {
    FILTERS,
    POSITIONS,
    THEMES,
    TRANSITIONS,
    filterCss,
    type Filter,
    type Position,
    type SlideDraft,
    type Theme,
    type Transition,
} from '@/lib/albums';

type Photo = { id: number; url: string; caption: string | null; date: string | null };
type SongOption = { id: number; title: string; artist: string | null; playable: boolean; audio_url: string | null };

type Props = { photos: Photo[]; songs: SongOption[] };

const MAX_SLIDES = 30;
const MIN_DURATION = 1;
const MAX_DURATION = 300;
const DURATION_PRESETS = [3, 5, 8, 10, 15, 20, 30];

let seq = 0;
const newUid = () => `s${++seq}`;

const clampDuration = (n: number) => Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.round(n)));

const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

/** Number input that lets you clear and retype freely, and commits a valid value. */
function DurationInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
    const [text, setText] = useState(String(value));

    useEffect(() => {
        setText(String(value));
    }, [value]);

    const commit = (raw: string) => {
        const n = parseInt(raw, 10);
        if (Number.isNaN(n)) {
            setText(String(value));
            return;
        }
        const c = clampDuration(n);
        setText(String(c));
        onCommit(c);
    };

    return (
        <input
            type="number"
            inputMode="numeric"
            min={MIN_DURATION}
            max={MAX_DURATION}
            value={text}
            onChange={(e) => {
                setText(e.target.value);
                const n = parseInt(e.target.value, 10);
                if (!Number.isNaN(n) && n >= MIN_DURATION && n <= MAX_DURATION) onCommit(n);
            }}
            onBlur={(e) => commit(e.target.value)}
            style={{ width: 90 }}
        />
    );
}

export default function Create({ photos, songs }: Props) {
    const form = useForm<{
        title: string;
        description: string;
        theme: Theme;
        default_song_id: number | null;
        default_song_start: number | null;
        default_song_end: number | null;
    }>({
        title: '',
        description: '',
        theme: 'night',
        default_song_id: null,
        default_song_start: null,
        default_song_end: null,
    });

    const [slides, setSlides] = useState<SlideDraft[]>([]);
    const [selected, setSelected] = useState<string | null>(null);

    const current = slides.find((s) => s.uid === selected) ?? slides[0] ?? null;
    const idx = current ? slides.findIndex((s) => s.uid === current.uid) : -1;
    const theme = THEMES.find((t) => t.key === form.data.theme) ?? THEMES[0];

    const countByPhoto = useMemo(() => {
        const m = new Map<number, number>();
        slides.forEach((s) => m.set(s.memory_photo_id, (m.get(s.memory_photo_id) ?? 0) + 1));
        return m;
    }, [slides]);

    const totalDuration = useMemo(() => slides.reduce((sum, s) => sum + s.duration, 0), [slides]);

    const defaultSong = songs.find((s) => s.id === form.data.default_song_id) ?? null;

    /* Keep the song clip exactly as long as the whole album (sum of all slide durations). */
    useEffect(() => {
        if (!defaultSong?.audio_url || totalDuration <= 0) return;

        const start = form.data.default_song_start ?? 0;
        const end = start + totalDuration;

        if (form.data.default_song_start !== start || form.data.default_song_end !== end) {
            form.setData((d) => ({ ...d, default_song_start: start, default_song_end: end }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalDuration, defaultSong?.id, form.data.default_song_start, form.data.default_song_end]);

    const addPhoto = (p: Photo) => {
        if (slides.length >= MAX_SLIDES) return;
        const s: SlideDraft = {
            uid: newUid(),
            memory_photo_id: p.id,
            url: p.url,
            caption: '',
            duration: 5,
            caption_position: 'bottom',
            filter: 'none',
            transition: 'fade',
            song_id: null,
            song_start: null,
            song_end: null,
        };
        setSlides((prev) => [...prev, s]);
        setSelected(s.uid);
    };

    const patch = (uid: string, change: Partial<SlideDraft>) =>
        setSlides((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...change } : s)));

    const move = (uid: string, dir: -1 | 1) =>
        setSlides((prev) => {
            const i = prev.findIndex((s) => s.uid === uid);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= prev.length) return prev;
            const next = [...prev];
            [next[i], next[j]] = [next[j], next[i]];
            return next;
        });

    const remove = (uid: string) => {
        setSlides((prev) => prev.filter((s) => s.uid !== uid));
        if (selected === uid) setSelected(null);
    };

    const applyLookToAll = () => {
        if (!current) return;
        const { filter, transition, duration, caption_position } = current;
        setSlides((prev) => prev.map((s) => ({ ...s, filter, transition, duration, caption_position })));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            slides: slides.map((s) => ({
                memory_photo_id: s.memory_photo_id,
                caption: s.caption,
                duration: s.duration,
                caption_position: s.caption_position,
                filter: s.filter,
                transition: s.transition,
                // One song for the whole album now, so no per-slide songs.
                song_id: null,
                song_start: null,
                song_end: null,
            })),
        }));
        form.post('/albums');
    };

    const slideErrors = Object.entries(form.errors)
        .filter(([k]) => k.startsWith('slides'))
        .map(([, v]) => v);

    const canSave = !form.processing && form.data.title.trim() !== '' && slides.length > 0;
    const songLabel = (s: SongOption) => `${s.title}${s.artist ? ` · ${s.artist}` : ''}${s.playable ? '' : ' (link only)'}`;

    return (
        <AppLayout title="New album">
            <form onSubmit={submit} className="al">
                <div className="al-head">
                    <div>
                        <h1>📸 New album</h1>
                        <p>Pick photos, add music and make it yours. It stays a draft until you publish it.</p>
                    </div>
                    <div className="al-head-actions">
                        <Link href="/albums" className="al-btn ghost">
                            Cancel
                        </Link>
                    </div>
                </div>

                <div className="al-layout">
                    <div className="al-col">
                        {/* Details */}
                        <section className="al-card">
                            <h2>✨ Details</h2>
                            <label>
                                Title
                                <input
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    maxLength={120}
                                    placeholder="e.g. Our first year"
                                />
                            </label>
                            {form.errors.title && <small className="al-err">{form.errors.title}</small>}

                            <label>
                                Description (optional)
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    maxLength={300}
                                    rows={2}
                                />
                            </label>

                            <div className="al-field">
                                <span>Theme</span>
                                <div className="al-swatches">
                                    {THEMES.map((t) => (
                                        <button
                                            key={t.key}
                                            type="button"
                                            className={form.data.theme === t.key ? 'on' : ''}
                                            style={{ background: t.bg }}
                                            onClick={() => form.setData('theme', t.key)}
                                            title={t.label}
                                            aria-label={t.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            <label>
                                Album song (plays through the whole album)
                                <select
                                    value={form.data.default_song_id ?? ''}
                                    onChange={(e) => {
                                        const id = e.target.value ? Number(e.target.value) : null;
                                        form.setData((d) => ({ ...d, default_song_id: id, default_song_start: null, default_song_end: null }));
                                    }}
                                >
                                    <option value="">No music</option>
                                    {songs.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {songLabel(s)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {defaultSong?.audio_url && (
                                <>
                                    <small className="al-hint">
                                        The clip is always as long as your whole album ({formatTime(totalDuration)}). Drag to choose where in the
                                        song it starts.
                                    </small>
                                    <SongTrimmer
                                        key={defaultSong.id}
                                        audioUrl={defaultSong.audio_url}
                                        start={form.data.default_song_start}
                                        end={form.data.default_song_end}
                                        onChange={(s) =>
                                            form.setData((d) => ({
                                                ...d,
                                                default_song_start: s ?? 0,
                                                default_song_end: (s ?? 0) + Math.max(totalDuration, 1),
                                            }))
                                        }
                                    />
                                </>
                            )}
                            {defaultSong && !defaultSong.audio_url && (
                                <small className="al-hint">This song is link-only, so it can't play inside the album. Pick one with an uploaded file.</small>
                            )}
                            {form.errors.default_song_end && <small className="al-err">{form.errors.default_song_end}</small>}
                        </section>

                        {/* Photo picker */}
                        <section className="al-card">
                            <h2>🖼️ Pick photos</h2>
                            <p className="al-hint">
                                Tap a photo to add it as a slide (up to {MAX_SLIDES}). Photos you add become visible to her once the album is published,
                                even if their memory is private.
                            </p>
                            {photos.length === 0 ? (
                                <p className="al-hint">No memory photos yet. Add some in Memories first.</p>
                            ) : (
                                <div className="al-photos">
                                    {photos.map((p) => (
                                        <button key={p.id} type="button" onClick={() => addPhoto(p)} title={p.caption ?? ''}>
                                            <img src={p.url} alt="" loading="lazy" />
                                            {countByPhoto.has(p.id) && <b>{countByPhoto.get(p.id)}</b>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Slides */}
                        <section className="al-card">
                            <h2>
                                🎞️ Slides ({slides.length})
                                {slides.length > 0 && <small className="al-hint"> · Total {formatTime(totalDuration)}</small>}
                            </h2>
                            {slideErrors.length > 0 && <small className="al-err">{slideErrors[0]}</small>}
                            {slides.length === 0 && <p className="al-hint">Nothing here yet. Pick some photos above.</p>}

                            <div className="al-strip">
                                {slides.map((s, i) => (
                                    <button
                                        key={s.uid}
                                        type="button"
                                        className={current?.uid === s.uid ? 'on' : ''}
                                        onClick={() => setSelected(s.uid)}
                                    >
                                        <img src={s.url} alt="" style={{ filter: filterCss(s.filter) }} />
                                        <span>{i + 1}</span>
                                    </button>
                                ))}
                            </div>

                            {current && (
                                <div className="al-editor">
                                    <div className="al-editor-bar">
                                        <strong>Slide {idx + 1}</strong>
                                        <div>
                                            <button type="button" className="al-mini" disabled={idx === 0} onClick={() => move(current.uid, -1)}>
                                                ←
                                            </button>
                                            <button
                                                type="button"
                                                className="al-mini"
                                                disabled={idx === slides.length - 1}
                                                onClick={() => move(current.uid, 1)}
                                            >
                                                →
                                            </button>
                                            <button type="button" className="al-mini danger" onClick={() => remove(current.uid)}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <label>
                                        Caption
                                        <input
                                            value={current.caption}
                                            onChange={(e) => patch(current.uid, { caption: e.target.value })}
                                            maxLength={200}
                                            placeholder="Say something sweet..."
                                        />
                                    </label>

                                    <div className="al-field">
                                        <span>Caption position</span>
                                        <div className="al-seg">
                                            {POSITIONS.map((o) => (
                                                <button
                                                    key={o.key}
                                                    type="button"
                                                    className={current.caption_position === o.key ? 'on' : ''}
                                                    onClick={() => patch(current.uid, { caption_position: o.key as Position })}
                                                >
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="al-field">
                                        <span>Filter</span>
                                        <div className="al-seg">
                                            {FILTERS.map((o) => (
                                                <button
                                                    key={o.key}
                                                    type="button"
                                                    className={current.filter === o.key ? 'on' : ''}
                                                    onClick={() => patch(current.uid, { filter: o.key as Filter })}
                                                >
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="al-field">
                                        <span>Transition</span>
                                        <div className="al-seg">
                                            {TRANSITIONS.map((o) => (
                                                <button
                                                    key={o.key}
                                                    type="button"
                                                    className={current.transition === o.key ? 'on' : ''}
                                                    onClick={() => patch(current.uid, { transition: o.key as Transition })}
                                                >
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="al-field">
                                        <span>How long this slide shows (this slide only)</span>
                                        <div className="al-seg">
                                            {DURATION_PRESETS.map((d) => (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    className={current.duration === d ? 'on' : ''}
                                                    onClick={() => patch(current.uid, { duration: d })}
                                                >
                                                    {d}s
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                            <DurationInput value={current.duration} onCommit={(n) => patch(current.uid, { duration: n })} />
                                            <span>seconds (1 to {MAX_DURATION})</span>
                                        </div>
                                    </div>

                                    <button type="button" className="al-btn ghost" onClick={applyLookToAll}>
                                        Apply filter, transition, duration &amp; caption position to all slides
                                    </button>
                                </div>
                            )}

                            <div className="al-save-row">
                                <button type="submit" className="al-btn" disabled={!canSave}>
                                    Save album
                                </button>
                                {!canSave && !form.processing && (
                                    <small className="al-hint">
                                        {slides.length === 0 ? 'Pick at least one photo to save.' : 'Add a title to save.'}
                                    </small>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Live preview */}
                    <aside className="al-side">
                        <div className="al-phone" style={{ background: theme.bg }}>
                            <div className="al-bars">
                                {slides.map((s, i) => (
                                    <i key={s.uid} className={i === idx ? 'on' : i < idx ? 'done' : ''} />
                                ))}
                            </div>

                            {current ? (
                                <img
                                    key={`${current.uid}-${current.transition}`}
                                    src={current.url}
                                    alt=""
                                    className={`al-shot t-${current.transition}`}
                                    style={{ filter: filterCss(current.filter) }}
                                />
                            ) : (
                                <p className="al-empty">Your story preview ♡</p>
                            )}

                            {current?.caption && <p className={`al-cap ${current.caption_position}`}>{current.caption}</p>}
                            {defaultSong && <div className="al-song">🎵 {defaultSong.title}</div>}
                        </div>
                        <small className="al-hint">Live preview. Use Preview in the song clip box to hear the music.</small>
                    </aside>
                </div>
            </form>
        </AppLayout>
    );
}