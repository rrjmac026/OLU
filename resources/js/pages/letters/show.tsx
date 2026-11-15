import { Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { occasionInfo, type LetterRow } from '@/lib/letters';

export default function Show({ letter }: { letter: LetterRow }) {
    const occ = occasionInfo(letter.occasion);

    const remove = () => {
        if (confirm('Delete this letter?')) router.delete(`/letters/${letter.id}`);
    };

    return (
        <AppLayout title={letter.title}>
            <p>
                <Link href="/letters">← All letters</Link>
            </p>

            <div className="olu-card letter-paper">
                {occ && <p className="letter-sub">{occ.emoji} {occ.label}</p>}
                <h1>{letter.title}</h1>
                <p className="letter-sub">Written {letter.created_label}</p>

                {letter.locked && (
                    <p>🔒 This one opens on {letter.unlock_label}. Worth the wait. 💗</p>
                )}

                {letter.sealed && (
                    <div className="letter-sealed">
                        <p>💌 This letter is sealed. Open it whenever you feel like it.</p>
                        <button className="olu-btn" onClick={() => router.post(`/letters/${letter.id}/open`)}>
                            Open letter
                        </button>
                    </div>
                )}

                {letter.body !== null && <div className="letter-body">{letter.body}</div>}

                {letter.is_sender && (
                    <div className="letter-actions">
                        {letter.unlock_label && <p className="letter-sub">Unlocks {letter.unlock_label}</p>}
                        <Link href={`/letters/${letter.id}/edit`} className="olu-btn">
                            Edit
                        </Link>
                        <button className="olu-btn" onClick={remove}>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}