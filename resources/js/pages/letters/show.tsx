import '../../../css/letters.css';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Heart, Lock, Mail, PenLine, Sparkles, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import LetterScene, { sceneFor } from '@/components/letter-scene';
import { occasionInfo, type LetterRow } from '@/lib/letters';

export default function Show({ letter }: { letter: LetterRow }) {
    const occ = occasionInfo(letter.occasion);

    const remove = () => {
        if (confirm('Delete this letter?')) router.delete(`/letters/${letter.id}`);
    };

    return (
        <AppLayout title={letter.title}>
            <div className="lt lt-narrow">
                <Link href="/letters" className="lt-back">
                    <ArrowLeft size={16} />
                    All letters
                </Link>

                <article className="lt-paper">
                    <div className="lt-thumb lt-banner scene">
                        <LetterScene scene={sceneFor(letter)} />
                    </div>

                    <div className="lt-paper-inner">
                        {occ && (
                            <span className="lt-chip">
                                {occ.emoji} {occ.label}
                            </span>
                        )}

                        <h1 className="lt-paper-title">
                            {letter.title}
                            <Heart size={24} />
                        </h1>

                        <div className="lt-paper-meta">
                            <span className="lt-date">
                                <Calendar size={14} />
                                Written {letter.created_label}
                            </span>
                        </div>

                        {letter.locked && (
                            <div className="lt-state">
                                <span className="lt-state-icon">
                                    <Lock size={26} />
                                </span>
                                <strong>Not yet...</strong>
                                <p>This one opens on {letter.unlock_label}. Worth the wait.</p>
                            </div>
                        )}

                        {letter.sealed && (
                            <div className="lt-state">
                                <span className="lt-state-icon">
                                    <Mail size={26} />
                                </span>
                                <strong>This letter is sealed</strong>
                                <p>Open it whenever you feel like it.</p>
                                <button type="button" className="lt-read" onClick={() => router.post(`/letters/${letter.id}/open`)}>
                                    <Heart size={15} />
                                    Open letter
                                </button>
                            </div>
                        )}

                        {letter.body !== null && <div className="lt-letter-body">{letter.body}</div>}

                        {letter.is_sender && (
                            <div className="lt-paper-actions">
                                {letter.unlock_label && (
                                    <span className="lt-unlock-note">
                                        <Sparkles size={15} />
                                        Unlocks {letter.unlock_label}
                                    </span>
                                )}
                                <Link href={`/letters/${letter.id}/edit`} className="lt-read">
                                    <PenLine size={15} />
                                    Edit
                                </Link>
                                <button type="button" className="lt-danger" onClick={remove}>
                                    <Trash2 size={15} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </AppLayout>
    );
}