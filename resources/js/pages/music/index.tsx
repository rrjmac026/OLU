import { router, useForm } from '@inertiajs/react';
import { Field } from '@/components/form-bits';
import AppLayout from '@/layouts/app-layout';
import type { SongRow } from '@/lib/bucket';

export default function Index({ songs }: { songs: SongRow[] }) {
    const form = useForm({ title: '', artist: '', link: '', note: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/music', { preserveScroll: true, onSuccess: () => form.reset() });
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
                    Add song
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