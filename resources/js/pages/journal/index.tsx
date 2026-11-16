import { Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, Lock, Plus, Users } from 'lucide-react';
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
            <div className="jr">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <BookOpen size={16} aria-hidden="true" /> Journal
                        </span>
                        <h1 className="jr-title">
                            Our <span>journal</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Days, dreams and little thoughts worth keeping.</p>
                    </div>
                    <Link href="/journal/create" className="home-btn jr-new">
                        <Plus size={18} aria-hidden="true" /> New entry
                    </Link>
                </section>

                <nav className="jr-tabs" aria-label="Journal filter">
                    {tabs.map((t) => (
                        <Link key={t.key} href={t.href} className={tab === t.key ? 'active' : ''}>
                            {t.label}
                        </Link>
                    ))}
                </nav>

                <section className="home-panel">
                    {entries.data.length === 0 ? (
                        <div className="jr-empty">
                            <span aria-hidden="true">📖</span>
                            <strong>Nothing here yet</strong>
                            <small>
                                {tab === 'shared'
                                    ? 'Nothing has been shared with you yet.'
                                    : 'No entries yet. Write one whenever you like.'}
                            </small>
                            {tab !== 'shared' && (
                                <Link href="/journal/create" className="home-btn">
                                    Write your first entry
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="jr-list">
                            {entries.data.map((entry) => (
                                <Link key={entry.id} href={`/journal/${entry.id}`} className="jr-entry">
                                    <div className="jr-icon" aria-hidden="true">
                                        {journalIcon(entry.type)}
                                    </div>
                                    <div className="jr-entry-body">
                                        <div className="jr-entry-top">
                                            <strong>{entry.title || `${journalLabel(entry.type)} entry`}</strong>
                                            {entry.is_own ? (
                                                <span className="ci-chip jr-chip">
                                                    {entry.visibility === 'shared' ? (
                                                        <>
                                                            <Users size={11} aria-hidden="true" /> Shared
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock size={11} aria-hidden="true" /> Private
                                                        </>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="ci-chip">From {entry.author}</span>
                                            )}
                                        </div>
                                        <small>{formatDate(entry.date)}</small>
                                        <p>{entry.snippet}</p>
                                    </div>
                                    <ChevronRight className="home-chev" size={20} aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {entries.last_page > 1 && (
                    <div className="jr-pager">
                        {entries.prev_page_url ? (
                            <Link href={entries.prev_page_url} className="home-btn ghost">
                                ← Newer
                            </Link>
                        ) : (
                            <span />
                        )}
                        {entries.next_page_url ? (
                            <Link href={entries.next_page_url} className="home-btn ghost">
                                Older →
                            </Link>
                        ) : (
                            <span />
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}