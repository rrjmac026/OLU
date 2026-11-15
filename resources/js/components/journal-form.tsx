import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field } from './form-bits';

type Initial = {
    type: string;
    title: string;
    body: string;
    entry_date: string;
    visibility: 'private' | 'shared';
};

type Props = {
    initial: Initial;
    entryId?: number;
};

export default function JournalForm({ initial, entryId }: Props) {
    const form = useForm(initial);

    function submit(e: FormEvent) {
        e.preventDefault();

        if (entryId) {
            form.patch(`/journal/${entryId}`);
        } else {
            form.post('/journal');
        }
    }

    return (
        <form className="olu-card" onSubmit={submit}>
            <Field label="Type" error={form.errors.type}>
                <select value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                    <option value="diary">📖 Diary</option>
                    <option value="dream">🌙 Dream</option>
                </select>
            </Field>

            <Field label="Title (optional)" error={form.errors.title}>
                <input
                    type="text"
                    maxLength={120}
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                />
            </Field>

            <Field label="Date" error={form.errors.entry_date}>
                <input
                    type="date"
                    value={form.data.entry_date}
                    onChange={(e) => form.setData('entry_date', e.target.value)}
                />
            </Field>

            <Field label="Entry" error={form.errors.body}>
                <textarea
                    rows={12}
                    value={form.data.body}
                    onChange={(e) => form.setData('body', e.target.value)}
                />
            </Field>

            <Field label="Who can read this?" error={form.errors.visibility}>
                <select
                    value={form.data.visibility}
                    onChange={(e) => form.setData('visibility', e.target.value as 'private' | 'shared')}
                >
                    <option value="private">Private: only I can read this</option>
                    <option value="shared">Shared: my partner can read this</option>
                </select>
            </Field>

            <div className="olu-actions">
                <button className="olu-btn" type="submit" disabled={form.processing}>
                    Save entry
                </button>
                <Link href={entryId ? `/journal/${entryId}` : '/journal'} className="olu-muted">
                    Cancel
                </Link>
            </div>
        </form>
    );
}