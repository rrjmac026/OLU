import { Link, router } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';
import { formatDate, journalIcon, journalLabel } from '../../lib/format';

type Props = {
    entry: {
        id: number;
        type: string;
        title: string | null;
        body: string;
        date: string;
        visibility: 'private' | 'shared';
        is_own: boolean;
        author: string | null;
    };
};

export default function JournalShow({ entry }: Props) {
    function remove() {
        if (confirm('Delete this entry? This cannot be undone.')) {
            router.delete(`/journal/${entry.id}`);
        }
    }

    return (
        <AppLayout title={entry.title || `${journalLabel(entry.type)} entry`}>
            <div className="olu-card">
                <h2>
                    {journalIcon(entry.type)} {entry.title || `${journalLabel(entry.type)} entry`}
                </h2>
                <p className="olu-muted">
                    {formatDate(entry.date)}{' '}
                    {entry.is_own ? (
                        <span className="olu-badge">{entry.visibility === 'shared' ? 'Shared' : 'Private'}</span>
                    ) : (
                        <span className="olu-badge">Shared by {entry.author}</span>
                    )}
                </p>

                <div className="olu-prose">{entry.body}</div>

                <div className="olu-actions">
                    <Link href="/journal" className="olu-muted">
                        ← Back to journal
                    </Link>
                    {entry.is_own && (
                        <>
                            <Link href={`/journal/${entry.id}/edit`}>Edit</Link>
                            <button type="button" className="olu-link" onClick={remove}>
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}