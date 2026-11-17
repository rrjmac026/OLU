import { router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Item = {
    id: number;
    type: string;
    title: string;
    body: string | null;
    url: string | null;
    read: boolean;
    created_at: string;
};

const REFRESH_MS = 8000;

const ICONS: Record<string, string> = {
    checkin: '💗',
    journal: '📖',
    memory: '📸',
    letter: '💌',
    bucket: '🌠',
    song: '🎵',
    answer: '💭',
    quiz: '🧩',
    calendar: '📅',
    timeline: '✨',
    album: '🎞️',
    garden: '🌱',
    game: '🎮',
};

const xsrf = () =>
    decodeURIComponent(
        document.cookie
            .split('; ')
            .find((r) => r.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] ?? '',
    );

const call = (url: string, method = 'GET') =>
    fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrf(),
        },
    });

function timeAgo(iso: string) {
    const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (secs < 60) return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [unread, setUnread] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    const load = useCallback(async () => {
        if (document.visibilityState !== 'visible') return;
        try {
            const r = await call('/notifications');
            if (!r.ok) return;
            const data = await r.json();
            setItems(data.items);
            setUnread(data.unread);
        } catch {
            /* offline, try again on the next tick */
        }
    }, []);

    /* poll while the tab is visible, and refresh when you come back */
    useEffect(() => {
        load();
        const timer = window.setInterval(load, REFRESH_MS);
        document.addEventListener('visibilitychange', load);
        window.addEventListener('focus', load);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', load);
            window.removeEventListener('focus', load);
        };
    }, [load]);

    /* close on outside click / Escape */
    useEffect(() => {
        if (!open) return;
        const down = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const key = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', down);
        document.addEventListener('keydown', key);
        return () => {
            document.removeEventListener('mousedown', down);
            document.removeEventListener('keydown', key);
        };
    }, [open]);

    const openItem = async (n: Item) => {
        setOpen(false);
        if (!n.read) {
            setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
            setUnread((u) => Math.max(0, u - 1));
            call(`/notifications/${n.id}/read`, 'POST').catch(() => {});
        }
        if (n.url) router.visit(n.url);
    };

    const markAll = async () => {
        setItems((prev) => prev.map((i) => ({ ...i, read: true })));
        setUnread(0);
        call('/notifications/read', 'POST').catch(() => {});
    };

    const clearAll = async () => {
        setItems([]);
        setUnread(0);
        call('/notifications', 'DELETE').catch(() => {});
    };

    return (
        <div className="nb-wrap" ref={ref}>
            <button
                type="button"
                className="olu-bell"
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <Bell size={20} />
                {unread > 0 && <span className="nb-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>

            {open && (
                <div className="nb-panel" role="dialog" aria-label="Notifications">
                    <div className="nb-head">
                        <strong>Notifications</strong>
                        <div>
                            <button type="button" onClick={markAll} disabled={unread === 0}>
                                Mark all read
                            </button>
                            <button type="button" onClick={clearAll} disabled={items.length === 0}>
                                Clear
                            </button>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <p className="nb-empty">Nothing yet ♡</p>
                    ) : (
                        <ul className="nb-list">
                            {items.map((n) => (
                                <li key={n.id}>
                                    <button type="button" className={`nb-item${n.read ? '' : ' unread'}`} onClick={() => openItem(n)}>
                                        <span className="nb-ico">{ICONS[n.type] ?? '🔔'}</span>
                                        <span className="nb-text">
                                            <span className="nb-title">{n.title}</span>
                                            {n.body && <span className="nb-body">{n.body}</span>}
                                            <small>{timeAgo(n.created_at)}</small>
                                        </span>
                                        {!n.read && <i className="nb-dot" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}