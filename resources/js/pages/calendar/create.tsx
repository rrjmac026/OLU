import { Link } from '@inertiajs/react';
import CalendarForm from '../../components/calendar-form';
import AppLayout from '../../layouts/app-layout';
import '../../../css/calendar.css'; // adjust path

type Props = {
    date: string;
    defaultVisibility: 'private' | 'shared';
};

export default function CalendarCreate({ date, defaultVisibility }: Props) {
    return (
        <AppLayout title="New event">
            <div className="cl">
                <Link href="/calendar" className="cl-back">
                    ← Back to calendar
                </Link>
                <div className="cl-form-card">
                    <h1>New event ✨</h1>
                    <CalendarForm
                        action="/calendar"
                        method="post"
                        submitLabel="Save event"
                        initial={{
                            title: '',
                            notes: '',
                            event_date: date,
                            event_time: '',
                            type: 'other',
                            repeats_yearly: false,
                            visibility: defaultVisibility,
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}