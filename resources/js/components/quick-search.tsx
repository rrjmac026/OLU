import { router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { adminNavItems, allNavItems } from '../lib/nav';
import type { SharedProps } from '../types/olu';

/** Type a page name, press Enter (or click a result) to jump there. */
export default function QuickSearch() {
    const { auth } = usePage<SharedProps>().props;
    const isAdmin = auth.user?.role === 'admin';

    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);

    const results = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return [];

        const items = isAdmin ? [...allNavItems, ...adminNavItems] : allNavItems;

        return items.filter((i) => i.label.toLowerCase().includes(s)).slice(0, 6);
    }, [q, isAdmin]);

    function go(href: string) {
        setQ('');
        setOpen(false);
        router.visit(href);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (results[0]) go(results[0].href);
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Escape') {
            setOpen(false);
        }
    }

    return (
        <form className="olu-search" onSubmit={submit} role="search">
            <Search size={18} aria-hidden="true" />
            <input
                type="search"
                value={q}
                placeholder="Search..."
                aria-label="Jump to a page"
                onChange={(e) => {
                    setQ(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                onKeyDown={onKeyDown}
            />
            {open && results.length > 0 && (
                <ul className="olu-search-results">
                    {results.map((r) => {
                        const Icon = r.icon;

                        return (
                            <li key={r.href}>
                                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => go(r.href)}>
                                    <Icon size={16} aria-hidden="true" /> {r.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </form>
    );
}