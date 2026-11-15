export type BucketCategory = 'travel' | 'food' | 'experience' | 'goal' | 'other';

export type BucketRow = {
    id: number;
    title: string;
    category: BucketCategory;
    note: string | null;
    is_done: boolean;
    done_label: string | null;
    is_mine: boolean;
    added_by: string;
};

export type SongRow = {
    id: number;
    title: string;
    artist: string | null;
    link: string | null;
    note: string | null;
    is_mine: boolean;
    added_by: string;
};

export const categories: { value: BucketCategory; label: string; emoji: string }[] = [
    { value: 'travel', label: 'Travel', emoji: '✈️' },
    { value: 'food', label: 'Food', emoji: '🍜' },
    { value: 'experience', label: 'Experience', emoji: '🎡' },
    { value: 'goal', label: 'Goal', emoji: '🎯' },
    { value: 'other', label: 'Other', emoji: '✨' },
];

export const categoryEmoji = (value: BucketCategory) =>
    categories.find((c) => c.value === value)?.emoji ?? '✨';