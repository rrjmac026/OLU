import { Link, usePage } from '@inertiajs/react';
import { adminNavItems, navSections, settingsNavItem } from '../lib/nav';
import type { NavItem } from '../lib/nav';
import type { SharedProps } from '../types/olu';
import ChatDot from './chat-dot';
import { Infinity as Inf, Sparkle } from 'lucide-react';

type Props = {
    open: boolean;
    onNavigate: () => void;
};

export default function Sidebar({ open, onNavigate }: Props) {
    const { url } = usePage();
    const { auth } = usePage<SharedProps>().props;

    function isActive(item: NavItem) {
        if (item.exact) {
            return url === '/' || url.startsWith('/?');
        }

        if (item.matches) {
            return item.matches.some((prefix) => url.startsWith(prefix));
        }

        return url.startsWith(item.match ?? item.href);
    }

    function renderItem(item: NavItem) {
        const Icon = item.icon;

        return (
            <Link
                key={item.href}
                href={item.href}
                className={`olu-side-link ${isActive(item) ? 'active' : ''}`}
                onClick={onNavigate}
            >
                <span className="olu-side-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={2} />
                </span>
                <span>{item.label}</span>
                {item.dot && <ChatDot />}
            </Link>
        );
    }

    return (
        <aside className={`olu-sidebar ${open ? 'open' : ''}`}>
            <Link href="/" className="olu-side-brand" onClick={onNavigate}>
                <Inf size={34} strokeWidth={1.6} />
                <span>Our Little<br />Universe <Sparkle size={14} fill="currentColor" /></span>
            </Link>
            <nav>
                {navSections.map((section, i) => (
                    <div key={section.title ?? `section-${i}`} className="olu-side-group">
                        {section.title && <div className="olu-side-section">{section.title}</div>}
                        {section.items.map(renderItem)}
                    </div>
                ))}

                {auth.user?.role === 'admin' && (
                    <div className="olu-side-group">
                        <div className="olu-side-section">Admin</div>
                        {adminNavItems.map(renderItem)}
                    </div>
                )}

                <div className="olu-side-group olu-side-foot">
                    {renderItem(settingsNavItem)}
                    <div className="olu-side-love">Made with love ♡</div>
                </div>
            </nav>
        </aside>
    );
}