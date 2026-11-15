export const MAX_PHOTOS = 6;

export type MemoryRow = {
    id: number;
    caption: string | null;
    taken_label: string | null;
    taken_input: string | null;
    visibility: 'private' | 'shared';
    is_owner: boolean;
    owner_name: string;
    photos: { id: number }[];
    moment: { id: number; title: string } | null;
    timeline_moment_id: number | null;
};

export type MomentOption = { id: number; title: string };

export const photoUrl = (id: number) => `/memories/photos/${id}`;