import { Pencil } from 'lucide-react';
import JournalForm from '../../components/journal-form';
import AppLayout from '../../layouts/app-layout';

type Props = {
    entry: {
        id: number;
        type: string;
        title: string | null;
        body: string;
        date: string;
        visibility: 'private' | 'shared';
    };
};

export default function JournalEdit({ entry }: Props) {
    return (
        <AppLayout title="Edit entry">
            <div className="jr narrow">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <Pencil size={16} aria-hidden="true" /> Journal
                        </span>
                        <h1 className="jr-title">
                            Edit <span>entry</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Change anything you like.</p>
                    </div>
                </section>

                <JournalForm
                    entryId={entry.id}
                    initial={{
                        type: entry.type,
                        title: entry.title ?? '',
                        body: entry.body,
                        entry_date: entry.date,
                        visibility: entry.visibility,
                    }}
                />
            </div>
        </AppLayout>
    );
}