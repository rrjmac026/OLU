import '../../../css/backgrounds.css';
import { Sparkle } from 'lucide-react';
import { useState } from 'react';
import { GalleryPanel } from '@/features/backgrounds/components/gallery-panel';
import { Hero } from '@/features/backgrounds/components/hero';
import { Lightbox } from '@/features/backgrounds/components/lightbox';
import { Tile } from '@/features/backgrounds/components/tile';
import { UploadPanel } from '@/features/backgrounds/components/upload-panel';
import { useBackgrounds } from '@/features/backgrounds/hooks/use-backgrounds';
import type { BackgroundRow, Item, Tab } from '@/features/backgrounds/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ backgrounds }: { backgrounds: BackgroundRow[] }) {
    const [tab, setTab] = useState<Tab>('all');
    const [viewing, setViewing] = useState<Item | null>(null);
    const bg = useBackgrounds(backgrounds);

    const gallery =
        tab === 'fav'
            ? [...bg.presetItems, ...bg.uploadItems].filter((i) => bg.favs.includes(i.key))
            : bg.presetItems.filter((i) => tab === 'all' || i.cat === tab);

    const renderTile = (item: Item) => (
        <Tile
            key={item.key}
            item={item}
            busy={bg.busy === item.key}
            fav={bg.favs.includes(item.key)}
            onUse={() => bg.use(item)}
            onFav={() => bg.toggleFav(item.key)}
            onView={() => setViewing(item)}
            onDelete={item.kind === 'upload' && item.mine && item.id ? () => bg.removeRow(item.id as number) : undefined}
        />
    );

    return (
        <AppLayout title="Backgrounds">
            <div className="bk">
                <Hero />
                <UploadPanel active={bg.active} currentName={bg.currentName ?? 'Default gradient'} onClear={bg.clear} />

                <GalleryPanel tab={tab} onTab={setTab} notice={bg.notice} isEmpty={gallery.length === 0}>
                    {gallery.map(renderTile)}
                </GalleryPanel>

                {bg.uploadItems.length > 0 && (
                    <section className="bk-panel">
                        <div className="bk-head">
                            <h2>
                                <Sparkle size={20} />
                                Your Uploads &amp; History
                            </h2>
                        </div>
                        <div className="bk-grid">{bg.uploadItems.map(renderTile)}</div>
                    </section>
                )}
            </div>

            {viewing && (
                <Lightbox
                    item={viewing}
                    onClose={() => setViewing(null)}
                    onUse={(i) => {
                        bg.use(i);
                        setViewing(null);
                    }}
                />
            )}
        </AppLayout>
    );
}