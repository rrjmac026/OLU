import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { photoUrl, type MemoryRow } from '@/lib/memories';

export default function Index({ memories }: { memories: MemoryRow[] }) {
    return (
        <AppLayout title="Memories">
            <div className="olu-page-header">
                <h1>Our memories</h1>
                <Link href="/memories/create" className="olu-btn">
                    Add memory
                </Link>
            </div>

            {memories.length === 0 && <p>No memories yet. 📸</p>}

            <div className="memory-grid">
                {memories.map((m) => (
                    <Link key={m.id} href={`/memories/${m.id}`} className="memory-card">
                        {m.photos.length > 0 ? (
                            <img src={photoUrl(m.photos[0].id)} alt="" loading="lazy" />
                        ) : (
                            <div className="memory-card-empty">💭</div>
                        )}
                        <div className="memory-card-body">
                            <strong>{m.taken_label ?? 'Memory'}</strong>
                            {m.caption && <span className="memory-snippet">{m.caption}</span>}
                            <span className="memory-badges">
                                {m.photos.length > 1 && <span>🖼️ {m.photos.length}</span>}
                                <span>{m.visibility === 'shared' ? '💞 Shared' : '🔒 Private'}</span>
                                {!m.is_owner && <span>from {m.owner_name}</span>}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </AppLayout>
    );
}