import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Lock, Pencil, Trash2, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { photoUrl, type MemoryRow } from '@/lib/memories';

export default function Show({ memory }: { memory: MemoryRow }) {
    const [active, setActive] = useState(memory.photos[0]?.id ?? null);

    const remove = () => {
        if (confirm('Delete this memory and its photos?')) router.delete(`/memories/${memory.id}`);
    };

    return (
        <AppLayout title={memory.taken_label ?? 'Memory'}>
            <div className="me narrow">
                <Link href="/memories" className="jr-back">
                    <ArrowLeft size={16} aria-hidden="true" /> All memories
                </Link>

                <article className="home-panel me-paper">
                    <header className="me-paper-head">
                        <h1 className="jr-paper-title">{memory.taken_label ?? 'Memory'}</h1>
                        <div className="jr-meta">
                            <span className="ci-chip jr-chip">
                                {memory.visibility === 'shared' ? (
                                    <>
                                        <Users size={11} aria-hidden="true" /> Shared
                                    </>
                                ) : (
                                    <>
                                        <Lock size={11} aria-hidden="true" /> Private
                                    </>
                                )}
                            </span>
                            {!memory.is_owner && <span>from {memory.owner_name} ♡</span>}
                        </div>
                    </header>

                    {active !== null && (
                        <div className="me-stage">
                            <img src={photoUrl(active)} alt={memory.caption ?? ''} />
                        </div>
                    )}

                    {memory.photos.length > 1 && (
                        <div className="me-thumbs">
                            {memory.photos.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={p.id === active ? 'active' : ''}
                                    onClick={() => setActive(p.id)}
                                    aria-label="Show photo"
                                >
                                    <img src={photoUrl(p.id)} alt="" />
                                </button>
                            ))}
                        </div>
                    )}

                    {memory.caption && <p className="me-caption">{memory.caption}</p>}

                    {memory.moment && (
                        <p className="me-moment">
                            🌌 Part of{' '}
                            <Link href="/timeline">{memory.moment.title}</Link>
                        </p>
                    )}

                    {memory.is_owner && (
                        <div className="jr-actions">
                            <Link href={`/memories/${memory.id}/edit`} className="home-btn ghost">
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