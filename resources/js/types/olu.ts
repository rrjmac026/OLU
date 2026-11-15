export type Theme = 'light' | 'dark' | 'system';

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    display_name: string | null;
    theme: Theme;
};

export type SharedProps = {
    name: string;
    auth: { user: AuthUser | null };
    flash: { status: string | null };
};