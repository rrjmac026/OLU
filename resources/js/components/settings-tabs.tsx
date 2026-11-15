import { Link, usePage } from '@inertiajs/react';

const tabs = [
    { href: '/settings/profile', label: 'Profile' },
    { href: '/settings/preferences', label: 'Preferences' },
    { href: '/settings/privacy', label: 'Privacy' },
    { href: '/settings/password', label: 'Password' },
];

export default function SettingsTabs() {
    const { url } = usePage();

    return (
        <nav className="olu-tabs">
            {tabs.map((tab) => (
                <Link key={tab.href} href={tab.href} className={url.startsWith(tab.href) ? 'active' : ''}>
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}