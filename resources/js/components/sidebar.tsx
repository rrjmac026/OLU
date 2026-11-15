import { Link, usePage } from '@inertiajs/react';
import type { SharedProps } from '../types/olu';
import ChatDot from './chat-dot';

type Item = {
    href: string;
    label: string;
    icon: string;
    exact?: boolean;
    match?: string;
    dot?: boolean;
};

const mainItems: Item[] = [
    { href: '/', label: 'Home', icon: '🏠', exact: true },
    { href: '/checkins', label: 'Check-in', icon: '💭' },
    { href: '/journal', label: 'Journal', icon: '📖' },
    { href: '/chat', label: 'Chat', icon: '💬', dot: true },
    { href: '/letters', label: 'Letters', icon: '💌' },
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/comfort', label: 'Comfort', icon: '🫶' },
    { href: '/timeline', label: 'Our timeline', icon: '🌌' },
    { href: '/reasons', label: 'Reasons', icon: '💗' },
    { href: '/memories', label: 'Memories', icon: '📸' },
    { href: '/bucket', label: 'Bucket list', icon: '🎯' },
    { href: '/music', label: 'Music', icon: '🎵' },
    { href: '/backgrounds', label: 'Backgrounds', icon: '🖼️' },
    { href: '/questions', label: 'Questions', icon: '❓' },
    { href: '/quiz', label: 'Couple quiz', icon: '💞' },
    { href: '/wheel', label: 'Random wheel', icon: '🎡' },
    { href: '/games/tictactoe', label: 'Tic-tac-toe', icon: '⭕' },
    { href: '/games/memorymatch', label: 'Memory match', icon: '🃏' },
    { href: '/puzzle', label: 'Daily puzzle', icon: '🧩' },
    { href: '/settings/profile', label: 'Settings', icon: '⚙️', match: '/settings' },
];

const adminItems: Item[] = [
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/content', label: 'Content', icon: '🗂️' },
];

type Props = {
    open: boolean;
    onNavigate: () => void;
};

export default function Sidebar({ open, onNavigate }: Props) {
    const { url } = usePage();
    const { auth } = usePage<SharedProps>().props;

    function isActive(item: Item) {
        if (item.exact) {
            return url === '/' || url.startsWith('/?');
        }

        return url.startsWith(item.match ?? item.href);
    }

    function renderItem(item: Item) {
        return (
            <Link
                key={item.href}
                href={item.href}
                className={`olu-side-link ${isActive(item) ? 'active' : ''}`}
                onClick={onNavigate}
            >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.dot && <ChatDot />}
            </Link>
        );
    }

    return (
        <aside className={`olu-sidebar ${open ? 'open' : ''}`}>
            <nav>
                {mainItems.map(renderItem)}
                {auth.user?.role === 'admin' && (
                    <>
                        <div className="olu-side-section">Admin</div>
                        {adminItems.map(renderItem)}
                    </>
                )}
            </nav>
        </aside>
    );
}