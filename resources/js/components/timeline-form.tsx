import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Lock, Trash2, Users } from 'lucide-react';

export type TimelineFormData = {
    title: string;
    story: string;
    moment_date: string;
    visibility: 'private' | 'shared';
};

type Props = {
    initial: TimelineFormData;
    action: string;
    method: 'post' | 'patch';
    submitLabel: string;
    onDelete?: () => void;
};

export default function TimelineForm({ initial, action, method, submitLabel, onDelete }: Props) {
    const form = useForm<TimelineFormData>(initial);

    function submit(e: FormEvent) {
        e.preventDefault();

        if (method === 'post') {
            form.post(action);
        } else {
            form.patch(action);
        }
    }

    return (
        <form className="home-panel jr-form" onSubmit={submit}>
            <div className="jr-two">
                <div>
                    <label className="ci-label">What happened?</label>
                    <input
                        type="text"
                        value={form.data.title}
                        maxLength={120}
                        placeholder="Our first date"
                        onChange={(e) => form.setData('title', e.target.value)}
                        required
                    />
                    {form.errors.title && <p className="olu-cal-error">{form.errors.title}</p>}
                </div>
                <div>
                    <label className="ci-label">When</label>
                    <input
                        type="date"
                        value={form.data.moment_date}
                        onChange={(e) => form.setData('moment_date', e.target.value)}
                        required
                    />
                    {form.errors.moment_date && <p className="olu-cal-error">{form.errors.moment_date}</p>}
                </div>
            </div>

            <div>
                <label className="ci-label">The story (optional)</label>
                <textarea
                    className="ci-note"
                    rows={6}
                    value={form.data.story}
                    maxLength={2000}
                    placeholder="What do you remember about it?"
                    onChange={(e) => form.setData('story', e.target.value)}
                />
                {form.errors.story && <p className="olu-cal-error">{form.errors.story}</p>}
            </div>

            <div>
                <label className="ci-label">Who can see this?</label>
                <div className="ci-seg">
                    <button
                        type="button"
                        className={form.data.visibility === 'private' ? 'on' : ''}
                        onClick={() => form.setData('visibility', 'private')}
                    >
                        <Lock size={15} aria-hidden="true" /> Only me
                    </button>
                    <button
                        type="button"
                        className={form.data.visibility === 'shared' ? 'on' : ''}
                        onClick={() => form.setData('visibility', 'shared')}
                    >
                        <Users size={15} aria-hidden="true" /> Shared with my person
                    </button>
                </div>
                {form.errors.visibility && <p className="olu-cal-error">{form.errors.visibility}</p>}
            </div>

            <div className="jr-actions">
                <button type="submit" className="home-btn" disabled={form.processing}>
                    {form.processing ? 'Saving…' : submitLabel}
                </button>
                <Link href="/timeline" className="jr-cancel">
                    Cancel
                </Link>
                {onDelete && (
                    <button type="button" className="jr-danger tl-delete" onClick={onDelete}>
                        <Trash2 size={15} aria-hidden="true" /> Delete moment
                    </button>
                )}
            </div>
        </form>
    );
}