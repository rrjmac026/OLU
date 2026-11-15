import { router } from '@inertiajs/react';
import CalendarForm from '../../components/calendar-form';
import AppLayout from '../../layouts/app-layout';
import type { CalendarEvent } from '../../lib/calendar';

type Props = {
    event: CalendarEvent;
};

export default function CalendarEdit({ event }: Props) {
    function remove() {
        if (window.confirm('Delete this event?')) {
            router.delete(`/calendar/${event.id}`);
        }
    }

    return (
        <AppLayout title="Edit event">
            <h1>Edit event</h1>
            <div className="olu-card">
                <CalendarForm
                    action={`/calendar/${event.id}`}
                    method="patch"
                    submitLabel="Save changes"
                    initial={{
                        title: event.title,
                        notes: event.notes ?? '',
                        event_date: event.base_date,
                        event_time: event.time ?? '',
                        type: event.type,
                        repeats_yearly: event.repeats_yearly,
                        visibility: event.visibility,
                    }}
                />
                <p>
                    <button type="button" className="olu-btn" onClick={remove}>
                        Delete event
                    </button>
                </p>
            </div>
        </AppLayout>
    );
}