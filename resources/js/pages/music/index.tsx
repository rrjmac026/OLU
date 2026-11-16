import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, ListMusic, Music, Pause, Play, Repeat, Repeat1, Shuffle, SkipForward, Trash2, UploadCloud, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { SongRow } from '@/lib/bucket';
import { cycleRepeat, next, playSong, seek, setPlaylist, toggleShuffle, usePlayer } from '@/lib/player';
import { readAudioInfo } from '@/lib/audio-tags';


const sizeLabel = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function Index({ songs }: { songs: SongRow[] }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const player = usePlayer();
    const form = useForm<{
        title: string;
        artist: string;
        link: string;
        note: string;
        audio: File | null;
    }>({ title: '', artist: '', link: '', note: '', audio: null });

    // share the playable songs with the global player
    useEffect(() => {
        setPlaylist(
            songs
                .filter((s) => s.audio_url)
                .map((s) => ({ id: s.id, title: s.title, artist: s.artist, audio_url: s.audio_url as string })),
        );
    }, [songs]);

    const playableCount = songs.filter((s) => s.audio_url).length;
    const file = form.data.audio;

    const auto = useRef({ title: '', artist: '' });

    const pickFile = async (f: File | null) => {
        if (!f) {
            form.setData('audio', null);
            return;
        }
        const info = await readAudioInfo(f);

        const title =
            form.data.title === '' || form.data.title === auto.current.title ? (info.title ?? '') : form.data.title;
        const artist =
            form.data.artist === '' || form.data.artist === auto.current.artist ? (info.artist ?? '') : form.data.artist;

        auto.current = { title: info.title ?? '', artist: info.artist ?? '' };
        form.setData((d) => ({ ...d, audio: f, title, artist }));
    };

    const clearFile = () => {
        form.setData((d) => ({
            ...d,
            audio: null,
            title: d.title === auto.current.title ? '' : d.title,
            artist: d.artist === auto.current.artist ? '' : d.artist,
        }));
        auto.current = { title: '', artist: '' };
        if (fileRef.current) fileRef.current.value = '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/music', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                auto.current = { title: '', artist: '' };
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const remove = (id: number) => {
        if (confirm('Remove this song?')) router.delete(`/music/${id}`, { preserveScroll: true });
    };

    return (
        <AppLayout title="Music corner">
            <div className="mu">
                {/* Hero */}
                <section className="mu-hero">
                    <div>
                        <span className="home-pill">
                            <Music size={16} aria-hidden="true" /> Music corner
                        </span>
                        <h1 className="mu-title">
                            Our <span>playlist</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Songs that remind us of each other.</p>
                    </div>
                    <div className="mu-stats">
                        <div>
                            <strong>{songs.length}</strong>
                            <small>{songs.length === 1 ? 'song' : 'songs'}</small>
                        </div>
                        <div>
                            <strong>{playableCount}</strong>
                            <small>playable</small>
                        </div>
                    </div>
                </section>

                <div className="mu-grid">
                    {/* Add a song */}
                    <section className="home-panel">
                        <div className="home-panel-head">
                            <h2>
                                <UploadCloud size={18} aria-hidden="true" /> Add a song
                            </h2>
                        </div>

                        <form onSubmit={submit} className="mu-form">
                            <label
                                className={`mu-drop${dragging ? ' drag' : ''}${file ? ' has' : ''}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragging(true);
                                }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragging(false);
                                    const f = e.dataTransfer.files?.[0];
                                        if (f) void pickFile(f);
                                }}
                            >
                                <input
                                    ref={fileRef}
                                    type="file"
                                    className="mu-file-input"
                                    accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac"
                                    onChange={(e) => void pickFile(e.target.files?.[0] ?? null)}
                                />
                                <span className="mu-drop-icon">
                                    <UploadCloud size={26} aria-hidden="true" />
                                </span>
                                {file ? (
                                    <span className="mu-drop-text">
                                        <strong>{file.name}</strong>
                                        <small>{sizeLabel(file.size)}</small>
                                    </span>
                                ) : (
                                    <span className="mu-drop-text">
                                        <strong>Choose or drop a music file</strong>
                                        <small>mp3, m4a, wav… up to 20 MB</small>
                                    </span>
                                )}
                                {file && (
                                    <button
                                        type="button"
                                        className="ci-del"
                                        aria-label="Remove file"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            clearFile();
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </label>
                            {form.errors.audio && <p className="olu-cal-error">{form.errors.audio}</p>}

                            <div className="mu-two">
                                <div>
                                    <label className="ci-label">Song title</label>
                                    <input
                                        type="text"
                                        maxLength={150}
                                        placeholder="Our song"
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                    />
                                    {form.errors.title && <p className="olu-cal-error">{form.errors.title}</p>}
                                </div>
                                <div>
                                    <label className="ci-label">Artist (optional)</label>
                                    <input
                                        type="text"
                                        maxLength={150}
                                        placeholder="Who sings it?"
                                        value={form.data.artist}
                                        onChange={(e) => form.setData('artist', e.target.value)}
                                    />
                                    {form.errors.artist && <p className="olu-cal-error">{form.errors.artist}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="ci-label">Link (optional)</label>
                                <input
                                    type="url"
                                    maxLength={500}
                                    placeholder="https://…"
                                    value={form.data.link}
                                    onChange={(e) => form.setData('link', e.target.value)}
                                />
                                {form.errors.link && <p className="olu-cal-error">{form.errors.link}</p>}
                            </div>

                            <div>
                                <label className="ci-label">Why this song? (optional)</label>
                                <textarea
                                    className="ci-note"
                                    rows={3}
                                    maxLength={500}
                                    placeholder="It reminds me of…"
                                    value={form.data.note}
                                    onChange={(e) => form.setData('note', e.target.value)}
                                />
                                {form.errors.note && <p className="olu-cal-error">{form.errors.note}</p>}
                            </div>

                            <button type="submit" className="home-btn mu-submit" disabled={form.processing || !form.data.title}>
                                {form.processing ? 'Uploading…' : 'Add song ♡'}
                            </button>
                        </form>
                    </section>

                    {/* Playlist */}
                    <section className="home-panel">
                        <div className="home-panel-head">
                            <h2>
                                <ListMusic size={18} aria-hidden="true" /> Our songs
                            </h2>
                            <div className="mu-ctrls">
                                <button
                                    type="button"
                                    className={`mu-ctrl${player.shuffle ? ' on' : ''}`}
                                    onClick={toggleShuffle}
                                    disabled={playableCount === 0}
                                    aria-label={player.shuffle ? 'Shuffle on' : 'Shuffle off'}
                                    title={player.shuffle ? 'Shuffle on' : 'Shuffle off'}
                                >
                                    <Shuffle size={17} />
                                </button>
                                <button
                                    type="button"
                                    className="mu-ctrl"
                                    onClick={next}
                                    disabled={playableCount === 0}
                                    aria-label="Next song"
                                    title="Next song"
                                >
                                    <SkipForward size={17} fill="currentColor" />
                                </button>
                                <button
                                    type="button"
                                    className={`mu-ctrl${player.repeat !== 'off' ? ' on' : ''}`}
                                    onClick={cycleRepeat}
                                    disabled={playableCount === 0}
                                    aria-label={`Repeat ${player.repeat}`}
                                    title={player.repeat === 'one' ? 'Repeat one' : player.repeat === 'all' ? 'Repeat all' : 'Repeat off'}
                                >
                                    {player.repeat === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
                                </button>
                                <span className="mu-count">{songs.length}</span>
                            </div>
                        </div>

                        {songs.length === 0 ? (
                            <div className="mu-empty">
                                <span aria-hidden="true">🎵</span>
                                <strong>No songs yet</strong>
                                <small>Upload your first song and it will play on the Home page.</small>
                            </div>
                        ) : (
                            <div className="mu-list">
                                {songs.map((s) => {
                                    const active = player.currentId === s.id && !!s.audio_url;
                                    const isPlaying = active && player.playing;

                                    return (
                                        <article key={s.id} className={`mu-song${active ? ' active' : ''}`}>
                                            {s.audio_url ? (
                                                <button
                                                    type="button"
                                                    className="mu-play"
                                                    onClick={() => playSong(s.id)}
                                                    aria-label={isPlaying ? 'Pause' : 'Play'}
                                                >
                                                    {isPlaying ? (
                                                        <Pause size={20} fill="currentColor" />
                                                    ) : (
                                                        <Play size={20} fill="currentColor" />
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="mu-song-icon" aria-hidden="true">
                                                    🎵
                                                </div>
                                            )}

                                            <div className="mu-song-body">
                                                <div className="mu-song-top">
                                                    <strong>{s.title}</strong>
                                                    {isPlaying && <span className="ci-chip">now playing</span>}
                                                </div>
                                                <small>{s.artist ?? 'Unknown artist'}</small>
                                                {s.note && <p className="mu-song-note">“{s.note}”</p>}

                                                {active && (
                                                    <div
                                                        className="home-bar seek"
                                                        onClick={(e) => {
                                                            const r = e.currentTarget.getBoundingClientRect();
                                                            seek((e.clientX - r.left) / r.width);
                                                        }}
                                                    >
                                                        <span style={{ width: `${player.progress}%` }} />
                                                    </div>
                                                )}

                                                <div className="mu-song-foot">
                                                    <small>added by {s.added_by} ♡</small>
                                                    {s.link && (
                                                        <a href={s.link} target="_blank" rel="noopener noreferrer">
                                                            Listen <ExternalLink size={13} aria-hidden="true" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {s.is_mine && (
                                                <button
                                                    type="button"
                                                    className="ci-del"
                                                    aria-label="Remove song"
                                                    onClick={() => remove(s.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}