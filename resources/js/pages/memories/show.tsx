import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { photoUrl, type MemoryRow } from '@/lib/memories';

export default function Show({ memory }: { memory: MemoryRow }) {
    const [active, setActive] = useState(memory.photos[0]?.id ?? null);

    const remove = () => {
        if (confirm('Delete this memory and its photos?')) router.delete(`/memories/${memory.id}`);
    };

    return (
        <AppLayout title={memory.taken_label ?? 'Memory'}>
            <p>
                <Link href="/memories">← All memories</Link>
            </p>

            <div className="olu-card">
                <h1>{memory.taken_label ?? 'Memory'}</h1>
                <p className="memory-badges">
                    <span>{memory.visibility === 'shared' ? '💞 Shared' : '🔒 Private'}</span>
                    {!memory.is_owner && <span>from {memory.owner_name}</span>}
                </p>

                {active !== null && <img className="memory-hero" src={photoUrl(active)} alt={memory.caption ?? ''} />}

                {memory.photos.length > 1 && (
                    <div className="memory-thumbs">
                        {memory.photos.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                className={p.id === active ? 'active' : ''}
                                onClick={() => setActive(p.id)}
                            >
                                <img src={photoUrl(p.id)} alt="" />
                            </button>
                        ))}
                    </div>
                )}

                {memory.caption && <p className="memory-caption">{memory.caption}</p>}

                {memory.moment && (
                    <p>
                        🌌 Part of: <Link href="/timeline">{memory.moment.title}</Link>
                    </p>
                )}

                {memory.is_owner && (
                    <div className="memory-actions">
                        <Link href={`/memories/${memory.id}/edit`} className="olu-btn">
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