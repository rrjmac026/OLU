export type Theme = 'night' | 'rose' | 'sunset' | 'forest';
export type Filter = 'none' | 'warm' | 'cool' | 'bw' | 'dreamy';
export type Transition = 'fade' | 'slide' | 'zoom';
export type Position = 'top' | 'center' | 'bottom';

export const THEMES: { key: Theme; label: string; bg: string }[] = [
    { key: 'night', label: 'Night sky', bg: 'linear-gradient(160deg,#1b1237,#3a2470)' },
    { key: 'rose', label: 'Rose', bg: 'linear-gradient(160deg,#4a1730,#c2527a)' },
    { key: 'sunset', label: 'Sunset', bg: 'linear-gradient(160deg,#3b1d4f,#f08a5d)' },
    { key: 'forest', label: 'Forest', bg: 'linear-gradient(160deg,#0f2a24,#3f8f6b)' },
];

export const FILTERS: { key: Filter; label: string; css: string }[] = [
    { key: 'none', label: 'Original', css: 'none' },
    { key: 'warm', label: 'Warm', css: 'sepia(.35) saturate(1.2) brightness(1.05)' },
    { key: 'cool', label: 'Cool', css: 'hue-rotate(15deg) saturate(1.1) brightness(1.02)' },
    { key: 'bw', label: 'Black & white', css: 'grayscale(1)' },
    { key: 'dreamy', label: 'Dreamy', css: 'contrast(.9) brightness(1.1) saturate(1.25) blur(.4px)' },
];

export const TRANSITIONS: { key: Transition; label: string }[] = [
    { key: 'fade', label: 'Fade' },
    { key: 'slide', label: 'Slide' },
    { key: 'zoom', label: 'Zoom' },
];

export const POSITIONS: { key: Position; label: string }[] = [
    { key: 'top', label: 'Top' },
    { key: 'center', label: 'Middle' },
    { key: 'bottom', label: 'Bottom' },
];

export const filterCss = (key: Filter) => FILTERS.find((f) => f.key === key)?.css ?? 'none';

export type SlideDraft = {
    uid: string;
    memory_photo_id: number;
    url: string;
    caption: string;
    duration: number;
    caption_position: Position;
    filter: Filter;
    transition: Transition;
    song_id: number | null;
    song_start: number | null;
    song_end: number | null;
};

export type SlideSong = {
    id: number;
    title: string;
    artist: string | null;
    audio_url: string | null;
    start: number | null;
    end: number | null;
};

export type ViewSlide = {
    id: number;
    url: string;
    caption: string | null;
    duration: number;
    caption_position: Position;
    filter: Filter;
    transition: Transition;
    song: SlideSong | null;
};

export type AlbumView = {
    id: number;
    title: string;
    description: string | null;
    theme: Theme;
    is_published: boolean;
    date_label: string;
    slides: ViewSlide[];
};

