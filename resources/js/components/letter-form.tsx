import { Link, useForm } from '@inertiajs/react';
import { Calendar, Gift, Heart, Send, Type } from 'lucide-react';
import type { ReactNode } from 'react';
import { occasions, type LetterRow } from '@/lib/letters';

type Props = { letter?: LetterRow };

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
    return (
        <div className="lt-field">
            <label className="lt-label">{label}</label>
            {children}
            {hint && !error && <p className="lt-hint">{hint}</p>}
            {error && <p className="lt-error">{error}</p>}
        </div>
    );
}

export default function LetterForm({ letter }: Props) {
    const form = useForm({
        kind: letter?.kind ?? 'love',
        occasion: letter?.occasion ?? 'sad',
        title: letter?.title ?? '',
        body: letter?.body ?? '',
        unlock_at: letter?.unlock_input ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (letter) form.put(`/letters/${letter.id}`);
        else form.post('/letters');
    };

    const setKind = (kind: 'love' | 'open_when') => form.setData('kind', kind);

    return (
        <form onSubmit={submit} className="lt-form">
            <section className="lt-panel">
                <div className="lt-panel-head">
                    <h2>
                        <Heart size={18} />
                        What kind of letter?
                    </h2>
                </div>

                <div className="lt-kinds">
                    <button type="button" className={`lt-kind ${form.data.kind === 'love' ? 'on' : ''}`} onClick={() => setKind('love')}>
                        <Heart size={24} />
                        <span>
                            <strong>Love letter</strong>
                            <small>Something to keep and read again</small>
                        </span>
                    </button>
                    <button type="button" className={`lt-kind ${form.data.kind === 'open_when' ? 'on' : ''}`} onClick={() => setKind('open_when')}>
                        <Gift size={24} />
                        <span>
                            <strong>Open-when letter</strong>
                            <small>For one special moment</small>
                        </span>
                    </button>
                </div>
                {form.errors.kind && <p className="lt-error">{form.errors.kind}</p>}

                {form.data.kind === 'open_when' && (
                    <div className="lt-field" style={{ marginTop: '1.1rem' }}>
                        <label className="lt-label">Open when...</label>
                        <div className="lt-occs">
                            {occasions.map((o) => (
                                <button
                                    key={o.value}
                                    type="button"
                                    className={`lt-occ ${form.data.occasion === o.value ? 'on' : ''}`}
                                    onClick={() => form.setData('occasion', o.value as typeof form.data.occasion)}
                                >
                                    <span className="lt-occ-emoji">{o.emoji}</span>
                                    {o.label}
                                </button>
                            ))}
                        </div>
                        {form.errors.occasion && <p className="lt-error">{form.errors.occasion}</p>}
                    </div>
                )}
            </section>

            <section className="lt-panel">
                <div className="lt-panel-head">
                    <h2>
                        <Type size={18} />
                        Your words
                    </h2>
                </div>

                <Field label="Title" error={form.errors.title}>
                    <input
                        type="text"
                        className="lt-input"
                        value={form.data.title}
                        maxLength={120}
                        placeholder="Give your letter a title..."
                        onChange={(e) => form.setData('title', e.target.value)}
                    />
                </Field>

                <Field label="Letter" error={form.errors.body}>
                    <textarea
                        className="lt-input"
                        rows={12}
                        value={form.data.body}
                        placeholder="Pour your heart out..."
                        onChange={(e) => form.setData('body', e.target.value)}
                    />
                </Field>
            </section>

            <section className="lt-panel">
                <div className="lt-panel-head">
                    <h2>
                        <Calendar size={18} />
                        Unlock date
                    </h2>
                </div>

                <Field
                    label="Unlock date & time (optional, in her timezone)"
                    error={form.errors.unlock_at}
                    hint="Optional - the letter stays locked until then."
                >
                    <input
                        type="datetime-local"
                        className="lt-input"
                        value={form.data.unlock_at}
                        onChange={(e) => form.setData('unlock_at', e.target.value)}
                    />
                </Field>
            </section>

            <div className="lt-form-actions">
                <button type="submit" className="lt-submit" disabled={form.processing}>
                    <Send size={17} />
                    {letter ? 'Save changes' : 'Seal letter'}
                </button>
                <Link href={letter ? `/letters/${letter.id}` : '/letters'} className="lt-cancel">
                    Cancel
                </Link>
            </div>
        </form>
    );
}