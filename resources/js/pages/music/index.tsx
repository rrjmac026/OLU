import { router, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Field } from '@/components/form-bits';
import AppLayout from '@/layouts/app-layout';
import type { SongRow } from '@/lib/bucket';

export default function Index({ songs }: { songs: SongRow[] }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const form = useForm<{
        title: string;
        artist: string;
        link: string;
        note: string;
        audio: File | null;
    }>({ title: '', artist: '', link: '', note: '', audio: null });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/music', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const remove = (id: number) => {
        if (confirm('Remove this song?')) router.delete(`/music/${id}`, { preserveScroll: true });
    };

    return (
        <AppLayout title="Music corner">
            <h1>Music corner</h1>

            <form onSubmit={submit} className="olu-card">
                <Field label="Song title" error={form.errors.title}>
                    <input
                        type="text"
                        maxLength={150}
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                    />
                </Field>
                <Field label="Artist (optional)" error={form.errors.artist}>
                    <input
                        type="text"
                        maxLength={150}
                        value={form.data.artist}
                        onChange={(e) => form.setData('artist', e.target.value)}
                    />
                </Field>
                <Field label="Upload music (mp3, m4a, wav… up to 20 MB)" error={form.errors.audio}>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac"
                        onChange={(e) => form.setData('audio', e.target.files?.[0] ?? null)}
                    />
                </Field>
                <Field label="Link (optional, https://…)" error={form.errors.link}>
                    <input
                        type="url"
                        maxLength={500}
                        value={form.data.link}
                        onChange={(e) => form.setData('link', e.target.value)}
                    />
                </Field>
                <Field label="Why this song? (optional)" error={form.errors.note}>
                    <textarea
                        rows={3}
                        maxLength={500}
                        value={form.data.note}
                        onChange={(e) => form.setData('note', e.target.value)}
                    />
                </Field>
                <button type="submit" className="olu-btn" disabled={form.processing}>
                    {form.processing ? 'Uploading…' : 'Add song'}
                </button>
            </form>

            {songs.length === 0 && <p>No songs yet. 🎵</p>}

            <div className="song-list">
                {songs.map((s) => (
                    <div key={s.id} className="song-card">
                        <div className="song-icon">🎵</div>
                        <div className="song-text">
                            <strong>{s.title}</strong>
                            {s.artist && <span className="song-sub">{s.artist}</span>}
                            {s.note && <p className="song-note">“{s.note}”</p>}
                            {s.audio_url && (
                                <audio controls preload="none" src={s.audio_url} style={{ width: '100%' }} />
                            )}
                            <span className="song-sub">added by {s.added_by}</span>
                            {s.link && (
                                <a href={s.link} target="_blank" rel="noopener noreferrer">
                                    Listen ↗
                                </a>
                            )}
                        </div>
                        {s.is_mine && (
                            <button type="button" className="bucket-remove" onClick={() => remove(s.id)}>
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}