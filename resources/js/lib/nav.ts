import {
    CalendarDays,
    Camera,
    CircleHelp,
    FolderOpen,
    Gift,
    Heart,
    HeartHandshake,
    House,
    Image,
    Images,
    Mail,
    MessageCircle,
    MessageSquare,
    Milestone,
    Music,
    NotebookPen,
    Settings,
    ScrollText,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
    match?: string;
    matches?: string[];
    dot?: boolean;
};

export type NavSection = { title: string | null; items: NavItem[] };

export const navSections: NavSection[] = [
    { title: null, items: [{ href: '/', label: 'Home', icon: House, exact: true }] },
    {
        title: 'Our Space',
        items: [
            { href: '/checkins', label: 'Check-in', icon: MessageCircle },
            { href: '/chat', label: 'Chat', icon: MessageSquare, dot: true },
        ],
    },
    {
        title: 'Our Memories',
        items: [
            { href: '/journal', label: 'Journal', icon: NotebookPen },
            { href: '/memories', label: 'Memories', icon: Camera },
            { href: '/albums', label: 'Album', icon: Images },
            { href: '/timeline', label: 'Timeline', icon: Milestone },
            { href: '/letters', label: 'Letters', icon: Mail },
        ],
    },
    {
        title: 'Our Relationship',
        items: [
            { href: '/reasons', label: 'Reasons', icon: Heart },
            { href: '/questions', label: 'Questions', icon: CircleHelp },
            { href: '/calendar', label: 'Calendar', icon: CalendarDays },
            { href: '/bucket', label: 'Bucket List', icon: Gift },
        ],
    },
    {
        title: 'Little Extras',
        items: [
            { href: '/comfort', label: 'Comfort', icon: HeartHandshake },
            { href: '/music', label: 'Music', icon: Music },
            { href: '/backgrounds', label: 'Backgrounds', icon: Image },
        ],
    },
];

export const settingsNavItem: NavItem = {
    href: '/settings/profile',
    label: 'Settings',
    icon: Settings,
    match: '/settings',
};

export const adminNavItems: NavItem[] = [
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/content', label: 'Content', icon: FolderOpen },
    { href: '/admin/activity', label: 'Activity', icon: ScrollText },
];

export const allNavItems: NavItem[] = [...navSections.flatMap((s) => s.items), settingsNavItem];