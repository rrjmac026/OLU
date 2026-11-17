export type BackgroundRow = { id: number; is_active: boolean; is_mine: boolean; added_by: string; preset: string | null };
export type Cat = 'dreamy' | 'nature' | 'others';
export type Tab = 'all' | Cat | 'fav';
export type Preset = { key: string; name: string; cat: Cat; draw: () => string };
export type Item = {
    key: string;
    kind: 'preset' | 'upload';
    name: string;
    src: string;
    active: boolean;
    cat?: Cat;
    id?: number;
    mine?: boolean;
    preset?: Preset;
};