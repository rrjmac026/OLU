import { router, useForm } from '@inertiajs/react';
import { Heart, History, Lock, Sparkle, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
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
    partner: { name: string } | null;
    partner_history: Entry[];
};

function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function CheckinsIndex({ today, history, default_visibility, partner, partner_history }: Props) {
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
            <div className="ci">
                <form className="home-panel" onSubmit={submit}>
                    <div className="home-panel-head">
                        <h2>
                            <Sparkle size={18} fill="currentColor" aria-hidden="true" /> How&apos;s your heart today?
                        </h2>
                    </div>
                    <p className="ci-sub">Check in whenever you feel like it. There&apos;s no pressure ♡</p>

                    <div className="ci-moods">
                        {MOODS.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                className={`ci-mood ${form.data.mood === m.value ? 'selected' : ''}`}
                                onClick={() => form.setData('mood', m.value)}
                            >
                                <span className="ci-mood-emoji">{m.emoji}</span>
                                <span>{m.label}</span>
                            </button>
                        ))}
                    </div>
                    {form.errors.mood && <p className="olu-error">{form.errors.mood}</p>}

                    <label className="ci-label" htmlFor="ci-note">A short note (optional)</label>
                    <textarea
                        id="ci-note"
                        className="ci-note"
                        rows={4}
                        maxLength={500}
                        placeholder="Anything you want to let out..."
                        value={form.data.note}
                        onChange={(e) => form.setData('note', e.target.value)}
                    />
                    {form.errors.note && <small className="olu-error">{form.errors.note}</small>}

                    <span className="ci-label">Who can see this?</span>
                    <div className="ci-seg" role="radiogroup" aria-label="Who can see this?">
                        <button
                            type="button"
                            role="radio"
                            aria-checked={form.data.visibility === 'private'}
                            className={form.data.visibility === 'private' ? 'on' : ''}
                            onClick={() => form.setData('visibility', 'private')}
                        >
                            <Lock size={15} aria-hidden="true" /> Only me
                        </button>
                        <button
                            type="button"
                            role="radio"
                            aria-checked={form.data.visibility === 'shared'}
                            className={form.data.visibility === 'shared' ? 'on' : ''}
                            onClick={() => form.setData('visibility', 'shared')}
                        >
                            <Heart size={15} aria-hidden="true" /> Shared with my partner
                        </button>
                    </div>
                    {form.errors.visibility && <small className="olu-error">{form.errors.visibility}</small>}

                    <div className="ci-submit">
                        <button className="home-btn" type="submit" disabled={form.processing || !form.data.mood}>
                            {today ? "Update today's check-in" : 'Save check-in'}
                        </button>
                    </div>
                </form>

                <section className="home-panel">
                    <div className="home-panel-head">
                        <h2>
                            <History size={18} aria-hidden="true" /> Mood history
                        </h2>
                    </div>

                    {history.length === 0 && <p className="olu-muted">Nothing here yet ♡</p>}

                    <div className="ci-history">
                        {history.map((entry) => {
                            const mood = moodInfo(entry.mood);

                            return (
                                <div className="ci-entry" key={entry.id}>
                                    <div className="ci-entry-emoji" aria-hidden="true">{mood.emoji}</div>
                                    <div className="ci-entry-body">
                                        <div className="ci-entry-top">
                                            <strong>{mood.label}</strong>
                                            <span className="ci-chip">{entry.visibility === 'shared' ? 'Shared' : 'Private'}</span>
                                        </div>
                                        <small>{formatDate(entry.date)}</small>
                                        {entry.note && <p>{entry.note}</p>}
                                    </div>
                                    <button type="button" className="ci-del" aria-label="Delete check-in" onClick={() => remove(entry)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
                {partner && (
                    <section className="home-panel ci-partner">
                        <div className="home-panel-head">
                            <h2>
                                <Heart size={18} aria-hidden="true" /> {partner.name}&apos;s moods
                            </h2>
                        </div>

                        {partner_history.length === 0 && (
                            <p className="olu-muted">Nothing shared yet ♡</p>
                        )}

                        <div className="ci-history">
                            {partner_history.map((entry) => {
                                const mood = moodInfo(entry.mood);

                                return (
                                    <div className="ci-entry" key={entry.id}>
                                        <div className="ci-entry-emoji" aria-hidden="true">{mood.emoji}</div>
                                        <div className="ci-entry-body">
                                            <div className="ci-entry-top"><strong>{mood.label}</strong></div>
                                            <small>{formatDate(entry.date)}</small>
                                            {entry.note && <p>{entry.note}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}