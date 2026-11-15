import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

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
};

export default function TimelineForm({ initial, action, method, submitLabel }: Props) {
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
        <form className="olu-cal-form" onSubmit={submit}>
            <label>
                What happened?
                <input
                    type="text"
                    value={form.data.title}
                    maxLength={120}
                    onChange={(e) => form.setData('title', e.target.value)}
                    required
                />
                {form.errors.title && <span className="olu-cal-error">{form.errors.title}</span>}
            </label>

            <label>
                When
                <input
                    type="date"
                    value={form.data.moment_date}
                    onChange={(e) => form.setData('moment_date', e.target.value)}
                    required
                />
                {form.errors.moment_date && <span className="olu-cal-error">{form.errors.moment_date}</span>}
            </label>

            <label>
                The story (optional)
                <textarea
                    rows={5}
                    value={form.data.story}
                    maxLength={2000}
                    onChange={(e) => form.setData('story', e.target.value)}
                />
                {form.errors.story && <span className="olu-cal-error">{form.errors.story}</span>}
            </label>

            <label>
                Who can see this?
                <select
                    value={form.data.visibility}
                    onChange={(e) => form.setData('visibility', e.target.value as 'private' | 'shared')}
                >
                    <option value="private">Only me</option>
                    <option value="shared">Shared with my person</option>
                </select>
                {form.errors.visibility && <span className="olu-cal-error">{form.errors.visibility}</span>}
            </label>

            <div className="row">
                <button type="submit" className="olu-btn" disabled={form.processing}>
                    {submitLabel}
                </button>
                <Link href="/timeline" className="olu-btn">
                    Cancel
                </Link>
            </div>
        </form>
    );
}