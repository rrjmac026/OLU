import type { Tab } from './types';

export const MAX_BYTES = 8 * 1024 * 1024;
export const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'dreamy', label: 'Dreamy' },
    { key: 'nature', label: 'Nature' },
    { key: 'others', label: 'Others' },
    { key: 'fav', label: 'Favorites' },
];