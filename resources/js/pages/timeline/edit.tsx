import { router } from '@inertiajs/react';
import TimelineForm from '../../components/timeline-form';
import AppLayout from '../../layouts/app-layout';
import type { Moment } from '../../lib/timeline';

type Props = {
    moment: Moment;
};

export default function TimelineEdit({ moment }: Props) {
    function remove() {
        if (window.confirm('Delete this moment?')) {
            router.delete(`/timeline/${moment.id}`);
        }
    }

    return (
        <AppLayout title="Edit moment">
            <h1>Edit moment</h1>
            <div className="olu-card">
                <TimelineForm
                    action={`/timeline/${moment.id}`}
                    method="patch"
                    submitLabel="Save changes"
                    initial={{
                        title: moment.title,
                        story: moment.story ?? '',
                        moment_date: moment.date,
                        visibility: moment.visibility,
                    }}
                />
                <p>
                    <button type="button" className="olu-btn" onClick={remove}>
                        Delete moment
                    </button>
                </p>
            </div>
        </AppLayout>
    );
}