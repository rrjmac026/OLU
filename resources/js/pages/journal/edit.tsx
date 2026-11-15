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
            <div className="olu-page-head">
                <h2>Edit entry</h2>
            </div>
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
        </AppLayout>
    );
}