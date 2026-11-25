export type ActivityLogRow = {
    id: number;
    user: string | null;
    action: string;
    action_label: string;
    description: string;
    subject_type: string | null;
    properties: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string | null;
};

export type ActivityFilters = {
    action?: string;
    user_id?: string | number;
    from?: string;
    to?: string;
    search?: string;
};

export type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
};

export function formatWhen(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function actionIcon(action: string): string {
    switch (action) {
        case 'login':
            return '🔑';
        case 'login_failed':
            return '⚠️';
        case 'logout':
            return '👋';
        case 'created':
            return '✨';
        case 'updated':
            return '✏️';
        case 'deleted':
            return '🗑️';
        case 'opened':
            return '💌';
        case 'published':
            return '📣';
        default:
            return '•';
    }
}

export function shortAgent(ua: string | null): string {
    if (!ua) return '';
    const browser =
        /Edg\//.test(ua) ? 'Edge' :
        /Chrome\//.test(ua) ? 'Chrome' :
        /Firefox\//.test(ua) ? 'Firefox' :
        /Safari\//.test(ua) ? 'Safari' : 'Browser';
    const os =
        /Windows/.test(ua) ? 'Windows' :
        /Android/.test(ua) ? 'Android' :
        /iPhone|iPad/.test(ua) ? 'iOS' :
        /Mac OS/.test(ua) ? 'macOS' :
        /Linux/.test(ua) ? 'Linux' : '';
    return os ? `${browser} on ${os}` : browser;
}