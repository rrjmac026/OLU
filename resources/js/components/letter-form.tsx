import { useForm } from '@inertiajs/react';
import { Field } from '@/components/form-bits';
import { occasions, type LetterRow } from '@/lib/letters';

type Props = { letter?: LetterRow };

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

    return (
        <form onSubmit={submit} className="olu-card">
            <Field label="Type" error={form.errors.kind}>
                <select value={form.data.kind} onChange={(e) => form.setData('kind', e.target.value as 'love' | 'open_when')}>
                    <option value="love">Love letter</option>
                    <option value="open_when">Open-when letter</option>
                </select>
            </Field>

            {form.data.kind === 'open_when' && (
                <Field label="Open when…" error={form.errors.occasion}>
                    <select value={form.data.occasion} onChange={(e) => form.setData('occasion', e.target.value as typeof form.data.occasion)}>
                        {occasions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.emoji} {o.label}
                            </option>
                        ))}
                    </select>
                </Field>
            )}

            <Field label="Title" error={form.errors.title}>
                <input type="text" value={form.data.title} maxLength={120} onChange={(e) => form.setData('title', e.target.value)} />
            </Field>

            <Field label="Letter" error={form.errors.body}>
                <textarea rows={12} value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} />
            </Field>

            <Field label="Unlock date & time (optional, in her timezone)" error={form.errors.unlock_at}>
                <input type="datetime-local" value={form.data.unlock_at} onChange={(e) => form.setData('unlock_at', e.target.value)} />
            </Field>

            <button type="submit" className="olu-btn" disabled={form.processing}>
                {letter ? 'Save changes' : 'Seal letter'}
            </button>
        </form>
    );
}