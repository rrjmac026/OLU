import { Heart } from 'lucide-react';
import TimelineForm from '../../components/timeline-form';
import AppLayout from '../../layouts/app-layout';

type Props = {
    date: string;
    defaultVisibility: 'private' | 'shared';
};

export default function TimelineCreate({ date, defaultVisibility }: Props) {
    return (
        <AppLayout title="New moment">
            <div className="tl narrow">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <Heart size={16} aria-hidden="true" /> Timeline
                        </span>
                        <h1 className="jr-title">
                            New <span>moment</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Add a new chapter to our story.</p>
                    </div>
                </section>

                <TimelineForm
                    action="/timeline"
                    method="post"
                    submitLabel="Save moment ♡"
                    initial={{ title: '', story: '', moment_date: date, visibility: defaultVisibility }}
                />
            </div>
        </AppLayout>
    );
}