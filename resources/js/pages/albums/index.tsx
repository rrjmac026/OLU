import { Link, router } from '@inertiajs/react';
import { CalendarDays, Heart, Images, LayoutGrid, List, Play, Plus } from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import AlbumViewer, { AlbumMenu } from '@/components/album-viewer';
import AppLayout from '@/layouts/app-layout';
import { THEMES, filterCss } from '@/lib/albums';
import type { AlbumView } from '@/lib/albums';

type Props = {
    albums: AlbumView[];
    can_manage: boolean;
};

export default function Index({ albums, can_manage }: Props) {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selectedId, setSelectedId] = useState<number | null>(albums[0]?.id ?? null);
    const [play, setPlay] = useState<{ id: number; n: number } | null>(null);

    const selected = albums.find((a) => a.id === selectedId) ?? albums[0] ?? null;

    const select = (id: number) => {
        setSelectedId(id);
        setPlay(null);
    };

    const playAlbum = (id: number) => {
        setSelectedId(id);
        setPlay({ id, n: Date.now() });
        document.getElementById('ab-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const publish = (id: number) => router.post(`/albums/${id}/publish`, {}, { preserveScroll: true });

    const remove = (id: number) => {
        if (confirm('Delete this album?')) router.delete(`/albums/${id}`, { preserveScroll: true });
    };

    return (
        <AppLayout title="Album">
            <div className="ab">
                {/* Hero */}
                <section className="ab-hero">
                    <i className="ab-spark s1">✦</i>
                    <i className="ab-spark s2">✦</i>
                    <i className="ab-spark s3">✧</i>

                    <div className="ab-hero-main">
                        <span className="ab-pill">
                            <Images size={16} /> Our Albums
                        </span>
                        <h1>
                            Our Albums <span>♡</span>
                        </h1>
                        <p>Save our favorite moments, with music, forever. ✨</p>
                    </div>

                    <div className="ab-scene" aria-hidden>
                        <i className="ab-shoot" />
                        <span className="ab-moon">🌙</span>
                        <span className="ab-star">⭐</span>
                        <div className="ab-clouds" />
                        <span className="ab-cat">🐱</span>
                        <span className="ab-z z1">z</span>
                        <span className="ab-z z2">Z</span>
                    </div>
                </section>

                <div className="ab-layout">
                    {/* Left: toolbar + albums */}
                    <div className="ab-left">
                        <div className="ab-toolbar">
                            {can_manage ? (
                                <Link href="/albums/create" className="ab-create">
                                    <Plus size={20} /> Create Album
                                    <i className="ab-spark c1">✦</i>
                                    <i className="ab-spark c2">✦</i>
                                </Link>
                            ) : (
                                <span />
                            )}

                            <div className="ab-toggle" role="group" aria-label="View">
                                <button type="button" className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>
                                    <LayoutGrid size={16} /> Grid
                                </button>
                                <button type="button" className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>
                                    <List size={16} /> List
                                </button>
                            </div>
                        </div>

                        <div className={`ab-cards ${view}`}>
                            {albums.map((a, i) => {
                                const theme = THEMES.find((t) => t.key === a.theme) ?? THEMES[0];
                                const first = a.slides[0];
                                const active = selected?.id === a.id;

                                return (
                                    <article
                                        key={a.id}
                                        className={`ab-card${active ? ' on' : ''}`}
                                        style={{ '--i': i } as CSSProperties}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => select(a.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') select(a.id);
                                        }}
                                    >
                                        <div className="ab-cover" style={{ background: theme.bg }}>
                                            {first && <img src={first.url} alt="" loading="lazy" style={{ filter: filterCss(first.filter) }} />}
                                            <span className="ab-count">
                                                <Images size={14} /> {a.slides.length}
                                            </span>
                                            {can_manage && !a.is_published && <span className="ab-draft">🔒 Draft</span>}
                                        </div>

                                        {can_manage && (
                                            <AlbumMenu
                                                className="on-card"
                                                published={a.is_published}
                                                onPublish={() => publish(a.id)}
                                                onDelete={() => remove(a.id)}
                                            />
                                        )}

                                        <div className="ab-card-body">
                                            <div className="ab-card-text">
                                                <h3>
                                                    <Heart size={16} /> {a.title}
                                                </h3>
                                                <p className="ab-meta">
                                                    <CalendarDays size={13} /> {a.date_label} • {a.slides.length} slides
                                                </p>
                                                {a.description && <p className="ab-desc">{a.description} ♡</p>}
                                            </div>

                                            <div className="ab-card-side">
                                                <button
                                                    type="button"
                                                    className="ab-card-play"
                                                    aria-label={`Play ${a.title}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playAlbum(a.id);
                                                    }}
                                                >
                                                    <Play size={20} fill="currentColor" />
                                                </button>
                                                <span className={`ab-eqb${active ? ' on' : ''}`} aria-hidden>
                                                    <i />
                                                    <i />
                                                    <i />
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}

                            {albums.length === 0 && (
                                <div className="ab-empty">
                                    <span>🌙</span>
                                    <p>No albums yet. New ones will show up here ♡</p>
                                </div>
                            )}

                            {can_manage && (
                                <Link href="/albums/create" className="ab-new" style={{ '--i': albums.length } as CSSProperties}>
                                    <i className="ab-spark n1">✦</i>
                                    <i className="ab-spark n2">✦</i>
                                    <span className="ab-new-plus">
                                        <Plus size={26} />
                                    </span>
                                    <strong>Create New Album</strong>
                                    <small>Turn your memories into a story ♡</small>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: viewer */}
                    <div className="ab-right">
                        {selected ? (
                            <AlbumViewer
                                key={selected.id}
                                album={selected}
                                autoplay={play?.id === selected.id}
                                playSignal={play?.id === selected.id ? play.n : 0}
                                canManage={can_manage}
                                onPublish={() => publish(selected.id)}
                                onDelete={() => remove(selected.id)}
                            />
                        ) : (
                            <div className="ab-viewer ab-viewer-empty">
                                <span>📸</span>
                                <p>Pick an album to watch it here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}