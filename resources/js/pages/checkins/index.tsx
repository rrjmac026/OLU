import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field } from '../../components/form-bits';
import AppLayout from '../../layouts/app-layout';
import { MOODS, moodInfo } from '../../lib/moods';

type Entry = {
    id: number;
    date: string;
    mood: string;
    note: string | null;
    visibility: 'private' | 'shared';
};

type Props = {
    today: Entry | null;
    history: Entry[];
    default_visibility: string;
};

function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function CheckinsIndex({ today, history, default_visibility }: Props) {
    const form = useForm({
        mood: today?.mood ?? '',
        note: today?.note ?? '',
        visibility: today?.visibility ?? default_visibility,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/checkins', { preserveScroll: true });
    }

    function remove(entry: Entry) {
        if (confirm('Delete this check-in?')) {
            router.delete(`/checkins/${entry.id}`, { preserveScroll: true });
        }
    }

    return (
        <AppLayout title="Check-in">
            <form className="olu-card" onSubmit={submit}>
                <h3>How are you today?</h3>
                <p className="olu-muted">Check in whenever you feel like it. There&apos;s no pressure.</p>

                <div className="olu-moods">
                    {MOODS.map((m) => (
                        <button
                            key={m.value}
                            type="button"
                            className={`olu-mood ${form.data.mood === m.value ? 'selected' : ''}`}
                            onClick={() => form.setData('mood', m.value)}
                        >
                            <span>{m.emoji}</span>
                            <span>{m.label}</span>
                        </button>
                    ))}
                </div>
                {form.errors.mood && <p className="olu-error">{form.errors.mood}</p>}

                <Field label="A short note (optional)" error={form.errors.note}>
                    <textarea
                        rows={3}
                        maxLength={500}
                        value={form.data.note}
                        onChange={(e) => form.setData('note', e.target.value)}
                    />
                </Field>

                <Field label="Who can see this?" error={form.errors.visibility}>
                    <select
                        value={form.data.visibility}
                        onChange={(e) => form.setData('visibility', e.target.value as 'private' | 'shared')}
                    >
                        <option value="private">Only me</option>
                        <option value="shared">Shared with my partner</option>
                    </select>
                </Field>

                <button className="olu-btn" type="submit" disabled={form.processing || !form.data.mood}>
                    {today ? "Update today's check-in" : 'Save check-in'}
                </button>
            </form>

            <div className="olu-card">
                <h3>Mood history</h3>
                {history.length === 0 && <p className="olu-muted">Nothing here yet.</p>}
                {history.map((entry) => {
                    const mood = moodInfo(entry.mood);

                    return (
                        <div className="olu-entry" key={entry.id}>
                            <div className="olu-entry-mood">{mood.emoji}</div>
                            <div className="olu-entry-body">
                                <strong>{mood.label}</strong> <span className="olu-muted">{formatDate(entry.date)}</span>{' '}
                                <span className="olu-badge">{entry.visibility === 'shared' ? 'Shared' : 'Private'}</span>
                                {entry.note && <p>{entry.note}</p>}
                            </div>
                            <button type="button" className="olu-link" onClick={() => remove(entry)}>
                                Delete
                            </button>
                        </div>
                    );
                })}
            </div>
        </AppLayout>
    );
}