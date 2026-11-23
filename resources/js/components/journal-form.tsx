import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Lock, Users } from 'lucide-react';

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

    const isDream = form.data.type === 'dream';

    return (
        <form className="home-panel jr-form" onSubmit={submit}>
            <div>
                <label className="ci-label">Type</label>
                <div className="ci-seg">
                    <button
                        type="button"
                        className={form.data.type === 'diary' ? 'on' : ''}
                        onClick={() => form.setData('type', 'diary')}
                    >
                        📖 Diary
                    </button>
                    <button
                        type="button"
                        className={isDream ? 'on' : ''}
                        onClick={() => form.setData('type', 'dream')}
                    >
                        🌙 Dream
                    </button>
                </div>
                {form.errors.type && <p className="olu-cal-error">{form.errors.type}</p>}
            </div>

            <div className="jr-two">
                <div>
                    <label className="ci-label">Title (optional)</label>
                    <input
                        type="text"
                        maxLength={120}
                        placeholder={isDream ? 'A strange dream…' : 'A little title'}
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                    />
                    {form.errors.title && <p className="olu-cal-error">{form.errors.title}</p>}
                </div>
                <div>
                    <label className="ci-label">Date</label>
                    <input
                        type="date"
                        value={form.data.entry_date}
                        onChange={(e) => form.setData('entry_date', e.target.value)}
                    />
                    {form.errors.entry_date && <p className="olu-cal-error">{form.errors.entry_date}</p>}
                </div>
            </div>

            <div>
                <label className="ci-label">Entry</label>
                <textarea
                    className="ci-note"
                    rows={12}
                    placeholder={isDream ? 'What did you dream about?' : 'How was your day?'}
                    value={form.data.body}
                    onChange={(e) => form.setData('body', e.target.value)}
                />
                {form.errors.body && <p className="olu-cal-error">{form.errors.body}</p>}
            </div>

            <div>
                <label className="ci-label">Who can read this?</label>
                <div className="ci-seg">
                    <button
                        type="button"
                        className={form.data.visibility === 'private' ? 'on' : ''}
                        onClick={() => form.setData('visibility', 'private')}
                    >
                        <Lock size={15} aria-hidden="true" /> Private
                    </button>
                    <button
                        type="button"
                        className={form.data.visibility === 'shared' ? 'on' : ''}
                        onClick={() => form.setData('visibility', 'shared')}
                    >
                        <Users size={15} aria-hidden="true" />{' '}
                        <span className="ci-long">Shared with my partner</span>
                        <span className="ci-short">Shared</span>
                    </button>
                </div>
                {form.errors.visibility && <p className="olu-cal-error">{form.errors.visibility}</p>}
            </div>

            <div className="jr-actions">
                <button className="home-btn" type="submit" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save entry ♡'}
                </button>
                <Link href={entryId ? `/journal/${entryId}` : '/journal'} className="jr-cancel">
                    Cancel
                </Link>
            </div>
        </form>
    );
}