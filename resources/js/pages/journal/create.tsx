import { NotebookPen } from 'lucide-react';
import JournalForm from '../../components/journal-form';
import AppLayout from '../../layouts/app-layout';

type Props = {
    default_visibility: string;
    today: string;
};

export default function JournalCreate({ default_visibility, today }: Props) {
    return (
        <AppLayout title="New entry">
            <div className="jr narrow">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <NotebookPen size={16} aria-hidden="true" /> Journal
                        </span>
                        <h1 className="jr-title">
                            New <span>entry</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Write down today, or last night&apos;s dream.</p>
                    </div>
                </section>

                <JournalForm
                    initial={{
                        type: 'diary',
                        title: '',
                        body: '',
                        entry_date: today,
                        visibility: default_visibility === 'shared' ? 'shared' : 'private',
                    }}
                />
            </div>
        </AppLayout>
    );
}