import { router, useForm } from '@inertiajs/react';
import { Field } from '@/components/form-bits';
import AppLayout from '@/layouts/app-layout';

type Mine = { id: number; answer: string; visibility: 'private' | 'shared' };
type Theirs = { name: string; answer: string };

type Props = {
    today: { question: string | null; mine: Mine | null; theirs: Theirs | null };
    history: { date_label: string; question: string; mine: Mine; theirs: Theirs | null }[];
    default_visibility: 'private' | 'shared';
};

const badge = (v: 'private' | 'shared') => (v === 'shared' ? '💞 Shared' : '🔒 Private');

export default function Index({ today, history, default_visibility }: Props) {
    const form = useForm({
        answer: today.mine?.answer ?? '',
        visibility: today.mine?.visibility ?? default_visibility,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/questions', { preserveScroll: true });
    };

    const remove = (id: number) => {
        if (confirm('Delete this answer?')) router.delete(`/questions/${id}`, { preserveScroll: true });
    };

    return (
        <AppLayout title="Questions">
            <h1>Question of the day</h1>

            {today.question === null ? (
                <div className="olu-card">
                    <p>No question today. 🌙</p>
                </div>
            ) : (
                <form onSubmit={submit} className="olu-card">
                    <p className="qa-question">{today.question}</p>

                    <Field label="Your answer" error={form.errors.answer}>
                        <textarea
                            rows={5}
                            maxLength={3000}
                            value={form.data.answer}
                            onChange={(e) => form.setData('answer', e.target.value)}
                        />
                    </Field>

                    <Field label="Who can see this?" error={form.errors.visibility}>
                        <select
                            value={form.data.visibility}
                            onChange={(e) => form.setData('visibility', e.target.value as 'private' | 'shared')}
                        >
                            <option value="private">🔒 Private (only me)</option>
                            <option value="shared">💞 Shared</option>
                        </select>
                    </Field>

                    <button type="submit" className="olu-btn" disabled={form.processing || !form.data.answer.trim()}>
                        {today.mine ? 'Update answer' : 'Save answer'}
                    </button>
                </form>
            )}

            {today.mine && today.theirs && (
                <div className="olu-card qa-theirs">
                    <strong>{today.theirs.name}&apos;s answer</strong>
                    <p className="qa-text">{today.theirs.answer}</p>
                </div>
            )}

            {!today.mine && today.question !== null && (
                <p className="qa-hint">Once you have answered, you will see theirs too, if they chose to share it.</p>
            )}

            {history.length > 0 && <h2>Earlier days</h2>}

            <div className="qa-history">
                {history.map((h) => (
                    <div key={h.mine.id} className="olu-card">
                        <span className="qa-date">{h.date_label}</span>
                        <p className="qa-question">{h.question}</p>

                        <div className="qa-block">
                            <div className="qa-block-head">
                                <strong>You</strong>
                                <span className="qa-badge">{badge(h.mine.visibility)}</span>
                                <button type="button" className="bucket-remove" onClick={() => remove(h.mine.id)}>
                                    ✕
                                </button>
                            </div>
                            <p className="qa-text">{h.mine.answer}</p>
                        </div>

                        {h.theirs && (
                            <div className="qa-block qa-theirs">
                                <div className="qa-block-head">
                                    <strong>{h.theirs.name}</strong>
                                </div>
                                <p className="qa-text">{h.theirs.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}