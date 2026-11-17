import { Link, router } from '@inertiajs/react';
import CalendarForm from '../../components/calendar-form';
import AppLayout from '../../layouts/app-layout';
import type { CalendarEvent } from '../../lib/calendar';
import '../../../css/calendar.css'; // adjust path

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
            <div className="cl">
                <Link href="/calendar" className="cl-back">
                    ← Back to calendar
                </Link>
                <div className="cl-form-card">
                    <h1>Edit event ✏️</h1>
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
                    <div className="cl-del-row">
                        <button type="button" className="cl-btn danger" onClick={remove}>
                            🗑️ Delete event
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}