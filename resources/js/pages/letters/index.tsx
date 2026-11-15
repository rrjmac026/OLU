import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { letterIcon, occasionInfo, type LetterRow } from '@/lib/letters';
import type { SharedProps } from '@/types/olu';

function LetterCard({ l }: { l: LetterRow }) {
    const occ = occasionInfo(l.occasion);
    const state = l.is_sender
        ? l.unlock_label
            ? `Unlocks ${l.unlock_label}`
            : 'Ready to open'
        : l.locked
          ? `Opens ${l.unlock_label}`
          : l.sealed
            ? 'Sealed · tap to open'
            : 'Opened';

    return (
        <Link href={`/letters/${l.id}`} className={`letter-card ${l.locked ? 'is-locked' : ''}`}>
            <span className="letter-icon">{letterIcon(l)}</span>
            <span className="letter-meta">
                <strong>{occ ? occ.label : l.title}</strong>
                {occ && <span className="letter-sub">{l.title}</span>}
                <span className="letter-sub">{state}</span>
            </span>
        </Link>
    );
}

export default function Index({ letters }: { letters: LetterRow[] }) {
    const { auth } = usePage<SharedProps>().props;
    const isAdmin = auth.user.role === 'admin';

    const love = letters.filter((l) => l.kind === 'love');
    const openWhen = letters.filter((l) => l.kind === 'open_when');

    return (
        <AppLayout title="Letters">
            <div className="olu-page-header">
                <h1>Letters</h1>
                {isAdmin && (
                    <Link href="/letters/create" className="olu-btn">
                        Write a letter
                    </Link>
                )}
            </div>

            {letters.length === 0 && <p>No letters yet. 💌</p>}

            {love.length > 0 && (
                <>
                    <h2>Love letters</h2>
                    <div className="letter-list">
                        {love.map((l) => (
                            <LetterCard key={l.id} l={l} />
                        ))}
                    </div>
                </>
            )}

            {openWhen.length > 0 && (
                <>
                    <h2>Open when…</h2>
                    <div className="letter-list">
                        {openWhen.map((l) => (
                            <LetterCard key={l.id} l={l} />
                        ))}
                    </div>
                </>
            )}
        </AppLayout>
    );
}