import { router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
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
            <div className="tl narrow">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <Pencil size={16} aria-hidden="true" /> Timeline
                        </span>
                        <h1 className="jr-title">
                            Edit <span>moment</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Change anything you like.</p>
                    </div>
                </section>

                <TimelineForm
                    action={`/timeline/${moment.id}`}
                    method="patch"
                    submitLabel="Save changes ♡"
                    onDelete={remove}
                    initial={{
                        title: moment.title,
                        story: moment.story ?? '',
                        moment_date: moment.date,
                        visibility: moment.visibility,
                    }}
                />
            </div>
        </AppLayout>
    );
}