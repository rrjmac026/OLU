import TimelineForm from '../../components/timeline-form';
import AppLayout from '../../layouts/app-layout';

type Props = {
    date: string;
    defaultVisibility: 'private' | 'shared';
};

export default function TimelineCreate({ date, defaultVisibility }: Props) {
    return (
        <AppLayout title="New moment">
            <h1>New moment</h1>
            <div className="olu-card">
                <TimelineForm
                    action="/timeline"
                    method="post"
                    submitLabel="Save moment"
                    initial={{ title: '', story: '', moment_date: date, visibility: defaultVisibility }}
                />
            </div>
        </AppLayout>
    );
}