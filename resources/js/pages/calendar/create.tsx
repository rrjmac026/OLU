import CalendarForm from '../../components/calendar-form';
import AppLayout from '../../layouts/app-layout';

type Props = {
    date: string;
    defaultVisibility: 'private' | 'shared';
};

export default function CalendarCreate({ date, defaultVisibility }: Props) {
    return (
        <AppLayout title="New event">
            <h1>New event</h1>
            <div className="olu-card">
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
        </AppLayout>
    );
}