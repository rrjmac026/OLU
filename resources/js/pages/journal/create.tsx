import JournalForm from '../../components/journal-form';
import AppLayout from '../../layouts/app-layout';

type Props = {
    default_visibility: string;
    today: string;
};

export default function JournalCreate({ default_visibility, today }: Props) {
    return (
        <AppLayout title="New entry">
            <div className="olu-page-head">
                <h2>New entry</h2>
            </div>
            <JournalForm
                initial={{
                    type: 'diary',
                    title: '',
                    body: '',
                    entry_date: today,
                    visibility: default_visibility === 'shared' ? 'shared' : 'private',
                }}
            />
        </AppLayout>
    );
}