import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { eventTypes } from '../lib/calendar';
import type { EventType } from '../lib/calendar';

export type CalendarFormData = {
    title: string;
    notes: string;
    event_date: string;
    event_time: string;
    type: EventType;
    repeats_yearly: boolean;
    visibility: 'private' | 'shared';
};

type Props = {
    initial: CalendarFormData;
    action: string;
    method: 'post' | 'patch';
    submitLabel: string;
};

export default function CalendarForm({ initial, action, method, submitLabel }: Props) {
    const form = useForm<CalendarFormData>(initial);

    function submit(e: FormEvent) {
        e.preventDefault();

        if (method === 'post') {
            form.post(action);
        } else {
            form.patch(action);
        }
    }

    return (
        <form className="cl-form" onSubmit={submit}>
            <label>
                Title
                <input
                    type="text"
                    value={form.data.title}
                    maxLength={120}
                    onChange={(e) => form.setData('title', e.target.value)}
                    required
                />
                {form.errors.title && <span className="cl-err">{form.errors.title}</span>}
            </label>

            <div className="cl-row">
                <label>
                    Date
                    <input
                        type="date"
                        value={form.data.event_date}
                        onChange={(e) => form.setData('event_date', e.target.value)}
                        required
                    />
                    {form.errors.event_date && <span className="cl-err">{form.errors.event_date}</span>}
                </label>
                <label>
                    Time (optional)
                    <input
                        type="time"
                        value={form.data.event_time}
                        onChange={(e) => form.setData('event_time', e.target.value)}
                    />
                    {form.errors.event_time && <span className="cl-err">{form.errors.event_time}</span>}
                </label>
            </div>

            <label>
                Type
                <select value={form.data.type} onChange={(e) => form.setData('type', e.target.value as EventType)}>
                    {eventTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.icon} {t.label}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Notes (optional)
                <textarea
                    rows={3}
                    value={form.data.notes}
                    maxLength={2000}
                    onChange={(e) => form.setData('notes', e.target.value)}
                />
                {form.errors.notes && <span className="cl-err">{form.errors.notes}</span>}
            </label>

            <label className="cl-check">
                <input
                    type="checkbox"
                    checked={form.data.repeats_yearly}
                    onChange={(e) => form.setData('repeats_yearly', e.target.checked)}
                />
                Repeats every year (birthdays, anniversaries)
            </label>

            <label>
                Who can see this?
                <select
                    value={form.data.visibility}
                    onChange={(e) => form.setData('visibility', e.target.value as 'private' | 'shared')}
                >
                    <option value="private">🔒 Only me</option>
                    <option value="shared">💞 Shared with my person</option>
                </select>
                {form.errors.visibility && <span className="cl-err">{form.errors.visibility}</span>}
            </label>

            <div className="cl-row">
                <button type="submit" className="cl-btn" disabled={form.processing}>
                    {submitLabel}
                </button>
                <Link href="/calendar" className="cl-btn ghost">
                    Cancel
                </Link>
            </div>
        </form>
    );
}