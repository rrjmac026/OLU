export type Moment = {
    id: number;
    title: string;
    story: string | null;
    date: string;
    visibility: 'private' | 'shared';
    mine: boolean;
    owner: string | null;
};