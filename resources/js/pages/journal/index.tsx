import { Link } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';
import { formatDate, journalIcon, journalLabel } from '../../lib/format';

type Entry = {
    id: number;
    type: string;
    title: string | null;
    snippet: string;
    date: string;
    visibility: 'private' | 'shared';
    is_own: boolean;
    author: string | null;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    entries: Paginated<Entry>;
    tab: 'all' | 'diary' | 'dream' | 'shared';
};

const tabs = [
    { key: 'all', label: 'All', href: '/journal' },
    { key: 'diary', label: 'Diary', href: '/journal?tab=diary' },
    { key: 'dream', label: 'Dreams', href: '/journal?tab=dream' },
    { key: 'shared', label: 'Shared with me', href: '/journal?tab=shared' },
] as const;

export default function JournalIndex({ entries, tab }: Props) {
    return (
        <AppLayout title="Journal">
            <div className="olu-page-head">
                <h2>Journal</h2>
                <Link href="/journal/create" className="olu-btn">
                    New entry
                </Link>
            </div>

            <nav className="olu-tabs">
                {tabs.map((t) => (
                    <Link key={t.key} href={t.href} className={tab === t.key ? 'active' : ''}>
                        {t.label}
                    </Link>
                ))}
            </nav>

            <div className="olu-card">
                {entries.data.length === 0 && (
                    <p className="olu-muted">
                        {tab === 'shared' ? 'Nothing has been shared with you yet.' : 'No entries yet. Write one whenever you like.'}
                    </p>
                )}

                {entries.data.map((entry) => (
                    <div className="olu-entry" key={entry.id}>
                        <div className="olu-entry-mood">{journalIcon(entry.type)}</div>
                        <div className="olu-entry-body">
                            <Link href={`/journal/${entry.id}`} className="olu-entry-link">
                                {entry.title || `${journalLabel(entry.type)} entry`}
                            </Link>{' '}
                            <span className="olu-muted">{formatDate(entry.date)}</span>{' '}
                            {entry.is_own ? (
                                <span className="olu-badge">{entry.visibility === 'shared' ? 'Shared' : 'Private'}</span>
                            ) : (
                                <span className="olu-badge">From {entry.author}</span>
                            )}
                            <p className="olu-muted">{entry.snippet}</p>
                        </div>
                    </div>
                ))}
            </div>

            {entries.last_page > 1 && (
                <div className="olu-pager">
                    {entries.prev_page_url ? <Link href={entries.prev_page_url}>← Newer</Link> : <span />}
                    {entries.next_page_url ? <Link href={entries.next_page_url}>Older →</Link> : <span />}
                </div>
            )}
        </AppLayout>
    );
}