export type WheelCategory = 'date' | 'talk' | 'challenge' | 'treat';

export type WheelItem = {
    id: number;
    category: WheelCategory;
    label: string;
};

export type ManagedItem = WheelItem & { is_active: boolean };

export const wheelCategories: { value: WheelCategory; label: string; emoji: string }[] = [
    { value: 'date', label: 'Date ideas', emoji: '💞' },
    { value: 'talk', label: 'Conversation', emoji: '💬' },
    { value: 'challenge', label: 'Challenges', emoji: '🎯' },
    { value: 'treat', label: 'Little treats', emoji: '🍬' },
];

export const categoryInfo = (value: WheelCategory) =>
    wheelCategories.find((c) => c.value === value) ?? wheelCategories[0];

export const SEGMENT_COLORS = [
    '#f8b4d0', '#c9b6f2', '#a8d8f0', '#f9d9a0',
    '#b9e6c4', '#f6c1b6', '#d6c4f0', '#ffe0b2',
];

export const MAX_SEGMENTS = 8;

export function sample<T>(list: T[], count: number): T[] {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}

const polar = (r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: r * Math.sin(rad), y: -r * Math.cos(rad) };
};

/** SVG path for one wheel segment, angles measured clockwise from the top. */
export function segmentPath(index: number, total: number, radius = 96): string {
    const seg = 360 / total;
    const a = polar(radius, index * seg);
    const b = polar(radius, (index + 1) * seg);
    const large = seg > 180 ? 1 : 0;
    return `M0 0 L${a.x} ${a.y} A${radius} ${radius} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

export const shortLabel = (text: string, max = 14) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);