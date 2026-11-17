import type { Preset } from '../types';
import { comet, starry, sunset } from './dreamy';
import { field, lake, sakura } from './nature';
import { castle, cozy } from './others';

// Order matches the gallery grid (4 per row)
export const PRESETS: Preset[] = [starry, sunset, comet, sakura, cozy, field, castle, lake];

export const getPreset = (key: string) => PRESETS.find((p) => p.key === key);

const srcCache = new Map<string, string>();

/** animated=false -> frozen first frame (cheap, and what gets saved as the JPG). */
export const presetSrc = (p: Preset, animated = false) => {
    const k = `${p.key}:${animated ? 'a' : 's'}`;
    let s = srcCache.get(k);
    if (!s) {
        let svg = p.draw();
        if (!animated) {
            svg = svg
                .replace(/<animate\b[^>]*\/>/g, '')
                .replace('<defs>', '<defs><style>*{animation-play-state:paused!important}</style>');
        }
        s = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        srcCache.set(k, s);
    }
    return s;
};

export async function renderPreset(p: Preset): Promise<File> {
    const img = new Image();
    await new Promise<void>((ok, fail) => {
        img.onload = () => ok();
        img.onerror = () => fail(new Error('render'));
        img.src = presetSrc(p);
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.drawImage(img, 0, 0, 1920, 1080);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.9));
    if (!blob) throw new Error('blob');
    return new File([blob], `${p.key}.jpg`, { type: 'image/jpeg' });
}