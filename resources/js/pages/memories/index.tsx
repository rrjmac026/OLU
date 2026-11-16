import { Link } from '@inertiajs/react';
import { Camera, Images, Lock, Plus, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { photoUrl, type MemoryRow } from '@/lib/memories';

export default function Index({ memories }: { memories: MemoryRow[] }) {
    const totalPhotos = memories.reduce((sum, m) => sum + m.photos.length, 0);

    return (
        <AppLayout title="Memories">
            <div className="me">
                <section className="jr-hero">
                    <div>
                        <span className="home-pill">
                            <Camera size={16} aria-hidden="true" /> Memories
                        </span>
                        <h1 className="jr-title">
                            Our <span>memories</span> <em aria-hidden="true">♡</em>
                        </h1>
                        <p className="home-sub">Little moments we never want to forget.</p>
                    </div>
                    <div className="me-hero-side">
                        <div className="mu-stats">
                            <div>
                                <strong>{memories.length}</strong>
                                <small>{memories.length === 1 ? 'memory' : 'memories'}</small>
                            </div>
                            <div>
                                <strong>{totalPhotos}</strong>
                                <small>{totalPhotos === 1 ? 'photo' : 'photos'}</small>
                            </div>
                        </div>
                        <Link href="/memories/create" className="home-btn jr-new">
                            <Plus size={18} aria-hidden="true" /> Add memory
                        </Link>
                    </div>
                </section>

                {memories.length === 0 ? (
                    <section className="home-panel">
                        <div className="jr-empty">
                            <span aria-hidden="true">📸</span>
                            <strong>No memories yet</strong>
                            <small>Add your first photo and the story behind it.</small>
                            <Link href="/memories/create" className="home-btn">
                                Add your first memory
                            </Link>
                        </div>
                    </section>
                ) : (
                    <div className="me-grid">
                        {memories.map((m) => (
                            <Link key={m.id} href={`/memories/${m.id}`} className="me-card">
                                <div className="me-card-img">
                                    {m.photos.length > 0 ? (
                                        <img src={photoUrl(m.photos[0].id)} alt="" loading="lazy" />
                                    ) : (
                                        <div className="me-card-empty" aria-hidden="true">
                                            💭
                                        </div>
                                    )}
                                    {m.photos.length > 1 && (
                                        <span className="me-count">
                                            <Images size={13} aria-hidden="true" /> {m.photos.length}
                                        </span>
                                    )}
                                </div>
                                <div className="me-card-body">
                                    <strong>{m.taken_label ?? 'Memory'}</strong>
                                    {m.caption && <p>{m.caption}</p>}
                                    <div className="me-card-foot">
                                        <span className="ci-chip jr-chip">
                                            {m.visibility === 'shared' ? (
                                                <>
                                                    <Users size={11} aria-hidden="true" /> Shared
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={11} aria-hidden="true" /> Private
                                                </>
                                            )}
                                        </span>
                                        {!m.is_owner && <small>from {m.owner_name} ♡</small>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}