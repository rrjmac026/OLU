export type LetterKind = 'love' | 'open_when';
export type LetterOccasion = 'sad' | 'miss_me' | 'encouragement' | 'happy' | 'cant_sleep';

export type LetterRow = {
    id: number;
    kind: LetterKind;
    occasion: LetterOccasion | null;
    title: string;
    is_sender: boolean;
    locked: boolean;
    sealed: boolean;
    opened: boolean | null;
    unlock_label: string | null;
    unlock_input: string | null;
    created_label: string;
    body: string | null;
};

export const occasions: { value: LetterOccasion; label: string; emoji: string }[] = [
    { value: 'sad', label: "Open when you're sad", emoji: '🌧️' },
    { value: 'miss_me', label: 'Open when you miss me', emoji: '🥺' },
    { value: 'encouragement', label: 'Open when you need encouragement', emoji: '🌟' },
    { value: 'happy', label: "Open when you're happy", emoji: '🌈' },
    { value: 'cant_sleep', label: "Open when you can't sleep", emoji: '🌙' },
];

export function occasionInfo(value: LetterOccasion | null) {
    return occasions.find((o) => o.value === value) ?? null;
}

export function letterIcon(l: LetterRow): string {
    if (l.is_sender) return l.kind === 'love' ? '💌' : '✉️';
    if (l.locked) return '🔒';
    if (l.sealed) return '💌';
    return '📖';
}