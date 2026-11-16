import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Lock, Pencil, Trash2, Users } from 'lucide-react';
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
    const title = entry.title || `${journalLabel(entry.type)} entry`;

    function remove() {
        if (confirm('Delete this entry? This cannot be undone.')) {
            router.delete(`/journal/${entry.id}`);
        }
    }

    return (
        <AppLayout title={title}>
            <div className="jr narrow">
                <Link href="/journal" className="jr-back">
                    <ArrowLeft size={16} aria-hidden="true" /> Back to journal
                </Link>

                <article className="home-panel jr-paper">
                    <header className="jr-paper-head">
                        <div className="jr-icon big" aria-hidden="true">
                            {journalIcon(entry.type)}
                        </div>
                        <div>
                            <h1 className="jr-paper-title">{title}</h1>
                            <div className="jr-meta">
                                <span>{formatDate(entry.date)}</span>
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
                                    <span className="ci-chip">Shared by {entry.author}</span>
                                )}
                            </div>
                        </div>
                    </header>

                    <div className="olu-prose jr-body">{entry.body}</div>

                    {entry.is_own && (
                        <div className="jr-actions">
                            <Link href={`/journal/${entry.id}/edit`} className="home-btn ghost">
                                <Pencil size={15} aria-hidden="true" /> Edit
                            </Link>
                            <button type="button" className="jr-danger" onClick={remove}>
                                <Trash2 size={15} aria-hidden="true" /> Delete
                            </button>
                        </div>
                    )}
                </article>
            </div>
        </AppLayout>
    );
}