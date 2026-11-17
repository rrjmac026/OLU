import { router } from '@inertiajs/react';
import { useState } from 'react';
import { PRESETS, presetSrc, renderPreset } from '../scenes';
import type { BackgroundRow, Item, Preset } from '../types';
import { useStored } from './use-stored';

export function useBackgrounds(backgrounds: BackgroundRow[]) {
    const [busy, setBusy] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [favs, setFavs] = useStored<string[]>('olu-bg-favs', []);

    const active = backgrounds.find((b) => b.is_active) ?? null;
    const activePreset = active?.preset ? PRESETS.find((p) => p.key === active.preset) : undefined;

    const presetItems: Item[] = PRESETS.map((p) => ({
        key: `p:${p.key}`,
        kind: 'preset',
        name: p.name,
        cat: p.cat,
        preset: p,
        src: presetSrc(p),
        active: active?.preset === p.key,
    }));

    const uploadItems: Item[] = backgrounds
        .filter((b) => !b.preset)
        .map((b) => ({
            key: `u:${b.id}`,
            kind: 'upload',
            id: b.id,
            mine: b.is_mine,
            name: `Added by ${b.added_by}`,
            src: `/backgrounds/${b.id}/image`,
            active: b.is_active,
        }));

    const currentName = activePreset?.name ?? (active ? `Added by ${active.added_by}` : 'Default gradient');

    const activateRow = (id: number) =>
        router.post(`/backgrounds/${id}/activate`, {}, { preserveScroll: true, onFinish: () => setBusy(null) });

    const clear = () => router.post('/backgrounds/clear', {}, { preserveScroll: true });

    const removeRow = (id: number) => {
        if (confirm('Delete this background?')) router.delete(`/backgrounds/${id}`, { preserveScroll: true });
    };

    async function applyPreset(p: Preset) {
        const existing = backgrounds.find((b) => b.preset === p.key);
        if (existing) {
            activateRow(existing.id);
            return;
        }
        try {
            const f = await renderPreset(p);
            router.post(
                '/backgrounds',
                { image: f, activate: true, preset: p.key },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onError: () => setNotice('Could not apply that background. Please try again.'),
                    onFinish: () => setBusy(null),
                },
            );
        } catch {
            setNotice('Could not prepare that background in your browser.');
            setBusy(null);
        }
    }

    const use = (item: Item) => {
        if (busy || item.active) return;
        setNotice(null);
        setBusy(item.key);
        if (item.kind === 'preset' && item.preset) void applyPreset(item.preset);
        else if (item.id) activateRow(item.id);
    };

    const toggleFav = (key: string) => setFavs((f) => (f.includes(key) ? f.filter((k) => k !== key) : [...f, key]));

    return { active, currentName, presetItems, uploadItems, favs, busy, notice, use, toggleFav, clear, removeRow };
}