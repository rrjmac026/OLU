import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

type Props = {
    audioUrl: string;
    start: number | null;
    end: number | null;
    onChange: (start: number | null, end: number | null) => void;
};

type Wave = { peaks: number[]; duration: number };

const BARS = 140;
const MIN_LEN = 3;
const cache = new Map<string, Wave>();

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const round = (v: number) => Math.round(v * 10) / 10;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

async function analyse(url: string): Promise<Wave> {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();

    const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) throw new Error('No audio support');

    const ctx = new Ctx();
    try {
        const audio = await ctx.decodeAudioData(buf);
        const data = audio.getChannelData(0);
        const block = Math.max(1, Math.floor(data.length / BARS));
        const step = Math.max(1, Math.floor(block / 40));

        const raw: number[] = [];
        for (let i = 0; i < BARS; i++) {
            let max = 0;
            for (let j = 0; j < block; j += step) {
                const v = Math.abs(data[i * block + j] ?? 0);
                if (v > max) max = v;
            }
            raw.push(max);
        }

        const top = Math.max(...raw, 0.001);
        return { peaks: raw.map((v) => v / top), duration: audio.duration };
    } finally {
        void ctx.close();
    }
}

export default function SongTrimmer({ audioUrl, start, end, onChange }: Props) {
    const [wave, setWave] = useState<Wave | null>(cache.get(audioUrl) ?? null);
    const [metaDuration, setMetaDuration] = useState(0);
    const [failed, setFailed] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [head, setHead] = useState<number | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ mode: 'start' | 'end' | 'move'; x: number; s: number; e: number } | null>(null);

    useEffect(() => {
        if (cache.has(audioUrl)) return;
        let dead = false;

        analyse(audioUrl)
            .then((w) => {
                cache.set(audioUrl, w);
                if (!dead) setWave(w);
            })
            .catch(() => {
                if (!dead) setFailed(true);
            });

        return () => {
            dead = true;
        };
    }, [audioUrl]);

    const duration = wave?.duration ?? metaDuration;
    const ready = duration > 0;
    const minLen = Math.min(MIN_LEN, duration);
    const s = clamp(start ?? 0, 0, duration);
    const e = clamp(end ?? duration, s, duration);

    /* ----- dragging ----- */

    const begin = (mode: 'start' | 'end' | 'move') => (ev: PointerEvent<HTMLElement>) => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.currentTarget.setPointerCapture(ev.pointerId);
        drag.current = { mode, x: ev.clientX, s, e };
    };

    const moveDrag = (ev: PointerEvent<HTMLElement>) => {
        const d = drag.current;
        const track = trackRef.current;
        if (!d || !track || !duration) return;

        const dt = ((ev.clientX - d.x) / track.getBoundingClientRect().width) * duration;
        let ns = d.s;
        let ne = d.e;

        if (d.mode === 'start') {
            ns = clamp(d.s + dt, 0, d.e - minLen);
        } else if (d.mode === 'end') {
            ne = clamp(d.e + dt, d.s + minLen, duration);
        } else {
            const len = d.e - d.s;
            ns = clamp(d.s + dt, 0, duration - len);
            ne = ns + len;
        }

        onChange(round(ns), round(ne));
    };

    const endDrag = () => {
        drag.current = null;
    };
    const trackDown = (ev: PointerEvent<HTMLElement>) => {
        const track = trackRef.current;
        if (!track || !duration) return;
        ev.preventDefault();

        const rect = track.getBoundingClientRect();
        const t = ((ev.clientX - rect.left) / rect.width) * duration;
        const len = e - s;
        const ns = clamp(t - len / 2, 0, Math.max(0, duration - len));

        track.setPointerCapture(ev.pointerId);
        drag.current = { mode: 'move', x: ev.clientX, s: ns, e: ns + len };
        onChange(round(ns), round(ns + len));
    };

    const nudge = (mode: 'start' | 'end') => (ev: KeyboardEvent<HTMLElement>) => {
        const dir = ev.key === 'ArrowLeft' ? -0.5 : ev.key === 'ArrowRight' ? 0.5 : 0;
        if (!dir) return;
        ev.preventDefault();

        if (mode === 'start') onChange(round(clamp(s + dir, 0, e - minLen)), round(e));
        else onChange(round(s), round(clamp(e + dir, s + minLen, duration)));
    };

    /* ----- preview ----- */

    const toggle = () => {
        const a = audioRef.current;
        if (!a || !ready) return;

        if (playing) {
            a.pause();
            return;
        }

        document.querySelectorAll('audio').forEach((el) => {
            if (el !== a) el.pause();
        });

        a.currentTime = s;
        a.play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
    };

    useEffect(() => {
        if (!playing) {
            setHead(null);
            return;
        }

        const a = audioRef.current;
        if (!a) return;

        let raf = 0;
        const tick = () => {
            if (a.currentTime >= e) {
                a.pause();
                return;
            }
            setHead(a.currentTime);
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [playing, e]);

    /* ----- render ----- */

    const pct = (t: number) => (duration ? (t / duration) * 100 : 0);
    const peaks = wave?.peaks ?? Array.from({ length: BARS }, () => 0.35);

    return (
        <div className="st">
            <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                onLoadedMetadata={(ev) => {
                    const d = ev.currentTarget.duration;
                    setMetaDuration(Number.isFinite(d) ? d : 0);
                }}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
            />

            <div className="st-top">
                <strong>✂️ Choose the part to play</strong>
                <div className="st-actions">
                    <button type="button" className="st-btn" onClick={toggle} disabled={!ready}>
                        {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Stop' : 'Preview'}
                    </button>
                    <button
                        type="button"
                        className="st-btn"
                        onClick={() => onChange(null, null)}
                        disabled={start === null && end === null}
                        title="Use the whole song"
                    >
                        <RotateCcw size={14} /> Whole song
                    </button>
                </div>
            </div>

            {!ready ? (
                <p className="al-hint">{failed ? "Couldn't read this song file." : 'Reading the waveform…'}</p>
            ) : (
                <>
                    <div
                        className="st-track"
                        ref={trackRef}
                        onPointerDown={trackDown}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                    >
                        <div className="st-wave" aria-hidden>
                            {peaks.map((p, i) => {
                                const t = ((i + 0.5) / peaks.length) * duration;
                                return <i key={i} className={t >= s && t <= e ? 'in' : ''} style={{ height: `${Math.max(10, p * 100)}%` }} />;
                            })}
                        </div>

                        <div className="st-dim" style={{ left: 0, width: `${pct(s)}%` }} />
                        <div className="st-dim" style={{ left: `${pct(e)}%`, right: 0 }} />

                        <div
                            className="st-region"
                            style={{ left: `${pct(s)}%`, width: `${pct(e) - pct(s)}%` }}
                            onPointerDown={begin('move')}
                            title="Drag to move the clip"
                        >
                            <span
                                className="st-grip l"
                                role="slider"
                                tabIndex={0}
                                aria-label="Clip start"
                                aria-valuemin={0}
                                aria-valuemax={Math.round(duration)}
                                aria-valuenow={Math.round(s)}
                                onPointerDown={begin('start')}
                                onKeyDown={nudge('start')}
                            />
                            <span
                                className="st-grip r"
                                role="slider"
                                tabIndex={0}
                                aria-label="Clip end"
                                aria-valuemin={0}
                                aria-valuemax={Math.round(duration)}
                                aria-valuenow={Math.round(e)}
                                onPointerDown={begin('end')}
                                onKeyDown={nudge('end')}
                            />
                        </div>

                        {head !== null && <div className="st-playhead" style={{ left: `${pct(head)}%` }} />}
                    </div>

                    <div className="st-times">
                        <span>
                            Start <b>{fmt(s)}</b>
                        </span>
                        <span>
                            Length <b>{fmt(e - s)}</b>
                        </span>
                        <span>
                            End <b>{fmt(e)}</b>
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}