import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Plant = {
    id: number;
    slot: number;
    stage: number;
    emoji: string;
    bloomed: boolean;
};

type Kind = {
    key: string;
    emoji: string;
};

type Props = {
    enabled: boolean;
    drops: number;
    slots: number;
    plants: Plant[];
    kinds: Kind[];
};

export default function Garden({ enabled, drops, slots, plants, kinds }: Props) {
    const [picking, setPicking] = useState<number | null>(null);

    const plantAt = (slot: number, kind: string) => {
        router.post('/garden/plant', { slot, kind }, { preserveScroll: true });
        setPicking(null);
    };

    const water = (id: number) => {
        router.post(`/garden/plants/${id}/water`, {}, { preserveScroll: true });
    };

    const clear = (id: number) => {
        if (confirm('Clear this plot?')) {
            router.delete(`/garden/plants/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Garden">
            <div className="olu-card garden">
                <h2>Our garden 🌷</h2>

                {!enabled && (
                    <p>
                        The garden is switched off. You can turn it back on any time in{' '}
                        <Link href="/settings/preferences">Settings</Link>.
                    </p>
                )}

                {enabled && (
                    <>
                        <p className="garden-drops">You have {drops} water drop{drops === 1 ? '' : 's'} 💧</p>
                        <p className="garden-note">
                            Playing together earns drops (daily answers, puzzles, finished games). They never expire,
                            and there is no hurry.
                        </p>

                        <div className="garden-grid">
                            {Array.from({ length: slots }, (_, slot) => {
                                const plant = plants.find((p) => p.slot === slot);

                                if (!plant) {
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            className="garden-plot empty"
                                            onClick={() => setPicking(picking === slot ? null : slot)}
                                            aria-label={`Empty plot ${slot + 1}, plant something`}
                                        >
                                            +
                                        </button>
                                    );
                                }

                                return (
                                    <div key={slot} className="garden-plot">
                                        <div className="garden-emoji">{plant.emoji}</div>
                                        <div className="garden-actions">
                                            <button
                                                type="button"
                                                className="garden-mini"
                                                disabled={plant.bloomed || drops < 1}
                                                onClick={() => water(plant.id)}
                                                aria-label="Water this plant"
                                            >
                                                💧
                                            </button>
                                            <button
                                                type="button"
                                                className="garden-mini"
                                                onClick={() => clear(plant.id)}
                                                aria-label="Clear this plot"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {picking !== null && (
                            <div className="garden-picker">
                                <p>What would you like to plant?</p>
                                <div className="garden-kinds">
                                    {kinds.map((kind) => (
                                        <button
                                            key={kind.key}
                                            type="button"
                                            className="garden-kind"
                                            onClick={() => plantAt(picking, kind.key)}
                                            aria-label={`Plant ${kind.key}`}
                                        >
                                            {kind.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}